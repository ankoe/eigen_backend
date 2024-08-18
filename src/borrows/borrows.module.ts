import { Module } from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './entities/borrow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow])],
  providers: [BorrowsService],
  // exports: [Borrow, BorrowsService],
})
export class BorrowsModule { }
