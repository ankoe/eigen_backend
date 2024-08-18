import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) { }

  @Post()
  async create(@Body() createMemberDto: CreateMemberDto) {
    try {
      await this.membersService.create(createMemberDto);
      return {
        success: true,
        message: 'Member Created Successfully',
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
      const data = await this.membersService.findAll();
      return {
        success: true,
        data,
        message: 'Member Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':member_id')
  async findOne(@Param('member_id') memberId: string) {
    try {
      const data = await this.membersService.findOne(+memberId);
      return {
        success: true,
        data,
        message: 'Member Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Patch(':member_id')
  async update(
    @Param('member_id') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    try {
      await this.membersService.update(+memberId, updateMemberDto);
      return {
        success: true,
        message: 'Member Updated Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':member_id')
  async remove(@Param('member_id') memberId: string) {
    try {
      await this.membersService.remove(+memberId);
      return {
        success: true,
        message: 'Member Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // @Get(':member_id/borrow')
  // async borrow(@Param('member_id') memberId: string) {
  //   try {
  //     this.membersService.remove(+memberId);
  //     return {
  //       success: true,
  //       message: 'Member Deleted Successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  // @Post(':member_id/borrow')
  // async borrowBook(@Param('member_id') memberId: string) {
  //   try {
  //     this.membersService.remove(+memberId);
  //     return {
  //       success: true,
  //       message: 'Member Deleted Successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  // @Delete(':member_id/borrow/:book_id')
  // async returnBook(
  //   @Param('member_id') memberId: string,
  //   @Param('book_id') bookId: string,
  // ) {
  //   try {
  //     this.membersService.remove(+memberId);
  //     return {
  //       success: true,
  //       message: 'Member Deleted Successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }
}
