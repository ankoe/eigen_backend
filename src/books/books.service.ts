import { HttpException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) { }

  async create(createBookDto: CreateBookDto) {
    const bookData = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(bookData);
  }

  async findAll() {
    const books = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.borrows', 'borrow', 'borrow.returnDate IS NULL')
      .select([
        'book.id AS id',
        'book.title AS title',
        'book.author AS author',
        'book.stock AS stock',
        'COUNT(borrow.id) AS count',
      ])
      .groupBy('book.id')
      .getRawMany();

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      stock: book.stock - parseInt(book.count, 10),
    }));
  }

  async findOne(id: number) {
    const existingBook = await this.bookRepository.findOneBy({ id });
    if (!existingBook) throw new HttpException('Book Not Found', 404);
    return existingBook;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const existingBook = await this.findOne(id);
    const bookData = this.bookRepository.merge(existingBook, updateBookDto);
    return await this.bookRepository.save(bookData);
  }

  async remove(id: number) {
    const existingBook = await this.findOne(id);
    return await this.bookRepository.softRemove(existingBook);
  }
}
