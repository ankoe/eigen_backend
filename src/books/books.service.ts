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
    return await this.bookRepository.find();
  }

  async findOne(id: number) {
    const bookData = await this.bookRepository.findOneBy({ id });
    if (!bookData) throw new HttpException('Book Not Found', 404);
    return bookData;
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
