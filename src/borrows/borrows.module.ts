import { forwardRef, Module } from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './entities/borrow.entity';
import { BooksModule } from 'src/books/books.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrow]),
    forwardRef(() => BooksModule),
    forwardRef(() => MembersModule),
  ],
  providers: [BorrowsService],
  exports: [TypeOrmModule, BorrowsService],
})
export class BorrowsModule { }
