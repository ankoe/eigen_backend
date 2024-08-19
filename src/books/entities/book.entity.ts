import { Borrow } from '../../borrows/entities/borrow.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ default: 1 })
  stock: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Borrow, (borrow) => borrow.book)
  borrows: Borrow[];
}
