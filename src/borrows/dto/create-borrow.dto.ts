import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateBorrowDto {
  @IsNotEmpty()
  @IsInt()
  bookId: number;
}
