import { forwardRef, Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowsModule } from 'src/borrows/borrows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), forwardRef(() => BorrowsModule)],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [TypeOrmModule],
})
export class BooksModule { }
