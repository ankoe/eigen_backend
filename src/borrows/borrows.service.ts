import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { Member } from '../members/entities/member.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class BorrowsService {
  constructor(
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) { }

  async findByMember(memberId: number) {
    return this.borrowRepository.find({
      where: { member: { id: memberId } },
      relations: ['book'],
    });
  }

  async borrowBook(memberId: number, bookId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['borrowedBooks'],
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['borrows'],
    });
    if (!member || !book)
      throw new HttpException('Member or book not found', 404);
    if (member.penaltyEndDate && member.penaltyEndDate > new Date())
      throw new HttpException('Member is currently penalized', 403);
    if (member.borrowedBooks.length >= 2) {
      throw new HttpException('Member cannot borrow more than 2 books', 403);
    }
    if (book.borrows.some((borrow) => !borrow.returnDate))
      throw new HttpException('Book is already borrowed', 403);
    const borrow = this.borrowRepository.create({
      member,
      book,
      borrowDate: new Date(),
    });
    return await this.borrowRepository.save(borrow);
  }

  async returnBook(memberId: number, bookId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['borrowedBooks'],
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['borrows'],
    });
    if (!member || !book)
      throw new HttpException('Member or book not found', 404);

    const borrow = await this.borrowRepository.findOne({
      where: { member, book, returnDate: null },
    });
    if (!borrow) return 'This book was not borrowed by the member';

    const borrowDuration =
      (new Date().getTime() - borrow.borrowDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (borrowDuration > 7) {
      member.penaltyEndDate = new Date(
        new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
      );
      await this.memberRepository.save(member);
    }

    borrow.returnDate = new Date();
    return await this.borrowRepository.save(borrow);
  }
}
