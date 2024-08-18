import { Injectable } from '@nestjs/common';

@Injectable()
export class BorrowsService {
  // constructor(
  //   @InjectRepository(Borrow)
  //   private borrowRepository: Repository<Borrow>,
  //   @InjectRepository(Member)
  //   private memberRepository: Repository<Member>,
  //   @InjectRepository(Book)
  //   private bookRepository: Repository<Book>,
  // ) { }
  // async borrowBook(memberCode: string, bookCode: string): Promise<string> {
  //   const member = await this.memberRepository.findOne({
  //     where: { code: memberCode },
  //     relations: ['borrowedBooks'],
  //   });
  //   const book = await this.bookRepository.findOne({
  //     where: { code: bookCode },
  //     relations: ['borrows'],
  //   });
  //   if (!member || !book) return 'Member or book not found';
  //   if (member.penaltyEndDate && member.penaltyEndDate > new Date())
  //     return 'Member is currently penalized';
  //   if (member.borrowedBooks.length >= 2)
  //     return 'Member cannot borrow more than 2 books';
  //   if (book.borrows.some((borrow) => !borrow.returnDate))
  //     return 'Book is already borrowed';
  //   const borrow = this.borrowRepository.create({
  //     member,
  //     book,
  //     borrowDate: new Date(),
  //   });
  //   await this.borrowRepository.save(borrow);
  //   return 'Book borrowed successfully';
  // }
  // async returnBook(memberCode: string, bookCode: string): Promise<string> {
  //   const member = await this.memberRepository.findOne({
  //     where: { code: memberCode },
  //     relations: ['borrowedBooks'],
  //   });
  //   const book = await this.bookRepository.findOne({
  //     where: { code: bookCode },
  //     relations: ['borrows'],
  //   });
  //   if (!member || !book) return 'Member or book not found';
  //   const borrow = await this.borrowRepository.findOne({
  //     where: { member, book, returnDate: null },
  //   });
  //   if (!borrow) return 'This book was not borrowed by the member';
  //   borrow.returnDate = new Date();
  //   await this.borrowRepository.save(borrow);
  //   const borrowDuration =
  //     (borrow.returnDate.getTime() - borrow.borrowDate.getTime()) /
  //     (1000 * 60 * 60 * 24);
  //   if (borrowDuration > 7) {
  //     member.penaltyEndDate = new Date(
  //       borrow.returnDate.getTime() + 3 * 24 * 60 * 60 * 1000,
  //     );
  //     await this.memberRepository.save(member);
  //   }
  //   return 'Book returned successfully';
  // }
  // async checkBooks(): Promise<Book[]> {
  //   const books = await this.bookRepository.find({ relations: ['borrows'] });
  //   return books.filter(
  //     (book) => !book.borrows.some((borrow) => !borrow.returnDate),
  //   );
  // }
  // async checkMembers(): Promise<Member[]> {
  //   const members = await this.memberRepository.find({
  //     relations: ['borrowedBooks'],
  //   });
  //   return members;
  // }
}
