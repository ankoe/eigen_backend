import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Member, (member) => member.borrowedBooks)
  // member: Member;

  // @ManyToOne(() => Book, (book) => book.borrows)
  // book: Book;

  @Column()
  borrowDate: Date;

  @Column({ type: 'date', nullable: true })
  returnDate?: Date;
}
