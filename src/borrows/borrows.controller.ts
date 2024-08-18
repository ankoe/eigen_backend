import { Controller } from '@nestjs/common';

@Controller('borrows')
export class BorrowsController {
  // constructor(private readonly borrowService: BorrowsService) { }
  // @Post('borrow-book')
  // borrowBook(
  //   @Body('memberCode') memberCode: string,
  //   @Body('bookCode') bookCode: string,
  // ) {
  //   return this.borrowService.borrowBook(memberCode, bookCode);
  // }
  // @Post('return-book')
  // returnBook(
  //   @Body('memberCode') memberCode: string,
  //   @Body('bookCode') bookCode: string,
  // ) {
  //   return this.borrowService.returnBook(memberCode, bookCode);
  // }
  // @Get('check-books')
  // checkBooks() {
  //   return this.borrowService.checkBooks();
  // }
  // @Get('check-members')
  // checkMembers() {
  //   return this.borrowService.checkMembers();
  // }
}
