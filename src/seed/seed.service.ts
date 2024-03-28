import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from 'src/products/entities';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly productsService: ProductsService,
  ) {}
  async execute() {
    await this.deleteTables();
    await this.seedUsers();
    await this.seedProducts();
    return 'seed Executed!';
  }

  private async deleteTables() {
    await this.productRepository.delete({});
    await this.userRepository.delete({});
  }

  private async seedProducts() {
    // delete all products
    await this.productRepository.delete({});
    // insert seed products
    const products = initialData.products;

    const insertPromises = [];

    for (const product of products) {
      // get random user
      const randomUser = await this.userRepository
        .createQueryBuilder()
        .orderBy('RANDOM()')
        .getOne();

      insertPromises.push(this.productsService.create(product, randomUser));
    }

    await Promise.all(insertPromises);

    console.log('Products inserted');
  }

  private async seedUsers() {
    // insert seed users
    const users = initialData.users;

    const insertPromises = [];

    for (const user of users) {
      insertPromises.push(this.userRepository.create(user));
      user.password = bcrypt.hashSync(user.password, 10);
    }

    await Promise.all(insertPromises);
    await this.userRepository.save(users);

    console.log('Users inserted');
  }
}
