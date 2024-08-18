import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    try {
      await this.booksService.create(createBookDto);
      return {
        success: true,
        message: 'Book Created Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const data = await this.booksService.findAll();
      return {
        success: true,
        data,
        message: 'Book Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':book_id')
  async findOne(@Param('book_id') bookId: string) {
    try {
      const data = await this.booksService.findOne(+bookId);
      return {
        success: true,
        data,
        message: 'Book Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Patch(':book_id')
  async update(
    @Param('book_id') bookId: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    try {
      await this.booksService.update(+bookId, updateBookDto);
      return {
        success: true,
        message: 'Book Updated Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':book_id')
  async remove(@Param('book_id') bookId: string) {
    try {
      await this.booksService.remove(+bookId);
      return {
        success: true,
        message: 'Book Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
