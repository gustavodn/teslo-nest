import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    // Inject the repository
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productsRepository.create(productDetails);
      product.images = images.map((image) =>
        this.productImageRepository.create({ url: image }),
      );
      await this.productsRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: ['images'],
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productsRepository.findOneById(term);
    } else {
      const query = this.productsRepository.createQueryBuilder('product');
      product = await query
        .where('UPPER(product.title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;
    const product = await this.productsRepository.preload({
      id: id,
      ...rest,
      images: [],
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }
      await queryRunner.manager.save(product);

      //  this.productsRepository.save(product);
      await queryRunner.commitTransaction();

      return product;
    } catch (error) {
      this.handleException(error);
      await queryRunner.rollbackTransaction();
    }
    await queryRunner.release();
  }

  async remove(id: string) {
    const query = this.productsRepository.createQueryBuilder('product');
    query.where('product.id = :id', { id });

    const product = await query.getOne();

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    await this.productsRepository.delete(id);
  }

  private handleException(error: Error) {
    // control errors here
    this.logger.error(error.message);
    throw new Error('Method not implemented.');
  }
}
