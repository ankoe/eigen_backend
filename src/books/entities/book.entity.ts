import {
  Column,
  DeleteDateColumn,
  Entity,
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

  // @OneToMany(() => Borrow, (borrow) => borrow.book)
  // borrows: Borrow[];
}
