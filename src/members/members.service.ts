import { HttpException, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) { }

  async create(createMemberDto: CreateMemberDto) {
    const memberData = this.membersRepository.create(createMemberDto);
    const result = await this.membersRepository.save(memberData);
    return await this.membersRepository.save(result);
  }

  async findAll() {
    return await this.membersRepository.find();
  }

  async findOne(id: number) {
    const memberData = await this.membersRepository.findOneBy({ id });
    if (!memberData) throw new HttpException('Member Not Found', 404);
    return memberData;
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
}
