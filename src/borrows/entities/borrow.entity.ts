import { Book } from '../../books/entities/book.entity';
import { Member } from '../../members/entities/member.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, (member) => member.borrowedBooks)
  member: Member;

  @ManyToOne(() => Book, (book) => book.borrows)
  book: Book;

  @Column()
  borrowDate: Date;

  @Column({ type: 'date', nullable: true })
  returnDate?: Date;
}
