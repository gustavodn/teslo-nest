import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ProductImage } from './product_image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: 'uuid',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-shirt testlo ',
    description: 'Product Title',
    uniqueItems: false,
  })
  @Column('text', {
    unique: true,
    nullable: true,
  })
  title: string;

  @ApiProperty()
  @Column('numeric', {
    default: 0,
  })
  price: number;

  @ApiProperty()
  @Column('text', {
    nullable: true,
  })
  description: string;

  @ApiProperty()
  @Column('text', {
    unique: true,
    nullable: true,
  })
  slug: string;

  @ApiProperty()
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty()
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty()
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  checkSlugInsert() {
    if (!this.slug) {
      console.log('checkSlugInsert', this.slug);
      this.slug = this.slugify(this.title, { lower: true });
      console.log('checkSlugInsert', this.slug);
    }
  }

  private slugify(title: string, options: { lower: boolean }): string {
    const lower = options.lower;
    const slug = title
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    return lower ? slug.toLowerCase() : slug;
  }
}
