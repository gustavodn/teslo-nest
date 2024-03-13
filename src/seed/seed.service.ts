import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private readonly productsService: ProductsService,
  ) {}
  async execute() {
    await this.seedProducts();
    return 'seed Executed!';
  }

  private async seedProducts() {
    // delete all products
    await this.productRepository.delete({});
    // insert seed products
    const products = initialData.products;

    const insertPromises = [];

    for (const product of products) {
      insertPromises.push(this.productsService.create(product));
    }

    await Promise.all(insertPromises);

    console.log('Products inserted');
  }
}
