import { forwardRef, Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { BorrowsModule } from 'src/borrows/borrows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    forwardRef(() => BorrowsModule),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [TypeOrmModule],
})
export class MembersModule { }
