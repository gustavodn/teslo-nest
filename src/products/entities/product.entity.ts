import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product_image.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  title: string;

  @Column('numeric', {
    default: 0,
  })
  price: number;

  @Column('text', {
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

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
