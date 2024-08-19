import { HttpException, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowsService } from '../borrows/borrows.service';
import { CreateBorrowDto } from '../borrows/dto/create-borrow.dto';
import { MemberDTO } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    private readonly borrowsService: BorrowsService,
  ) { }

  async create(createMemberDto: CreateMemberDto) {
    const memberData = this.membersRepository.create(createMemberDto);
    const savedMember = await this.membersRepository.save(memberData);
    savedMember.code = `M${savedMember.id.toString().padStart(3, '0')}`;
    return await this.membersRepository.save(savedMember);
  }

  async findAll() {
    const existingMembers = await this.membersRepository.find({
      relations: ['borrowedBooks', 'borrowedBooks.book'],
    });
    return existingMembers.map((member) => new MemberDTO(member));
  }

  async findOne(id: number) {
    const existingMember = await this.membersRepository.findOne({
      where: { id },
      relations: ['borrowedBooks', 'borrowedBooks.book'],
    });
    if (!existingMember) throw new HttpException('Member Not Found', 404);
    return new MemberDTO(existingMember);
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const existingMember = await this.findOne(id);
    const memberData = this.membersRepository.merge(
      existingMember,
      updateMemberDto,
    );
    return await this.membersRepository.save(memberData);
  }

  async remove(id: number) {
    const existingMember = await this.findOne(id);
    return await this.membersRepository.softRemove(existingMember);
  }

  async getBorrowedBooks(id: number) {
    const existingMember = await this.findOne(id);
    return existingMember
      ? await this.borrowsService.findByMember(existingMember.id)
      : [];
  }

  async addBorrowedBooks(id: number, createBorrowDto: CreateBorrowDto) {
    const existingMember = await this.findOne(id);
    return this.borrowsService.borrowBook(
      existingMember.id,
      createBorrowDto.bookId,
    );
  }

  async returnBorrowedBooks(memberId: number, bookId: number) {
    const existingMember = await this.findOne(memberId);
    return await this.borrowsService.returnBook(existingMember.id, bookId);
  }
}
