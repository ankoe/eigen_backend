import { Borrow } from '../../borrows/entities/borrow.entity';
import { Exclude, Expose } from 'class-transformer';
import { Member } from '../entities/member.entity';

export class MemberDTO {
  @Expose()
  id: number;

  @Expose()
  code?: string;

  @Expose()
  name: string;

  @Expose()
  penaltyEndDate?: Date;

  @Exclude()
  borrowedBooks: Borrow[];

  @Expose()
  borrowedBooksCount: number;

  constructor(member: Member) {
    this.id = member.id;
    this.code = member.code;
    this.name = member.name;
    this.penaltyEndDate = member.penaltyEndDate;
    this.borrowedBooks = member.borrowedBooks;
    this.borrowedBooksCount = member.borrowedBooks.length;
  }
}
