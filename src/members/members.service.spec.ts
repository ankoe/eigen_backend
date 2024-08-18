import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { HttpException } from '@nestjs/common';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersService', () => {
  let service: MembersService;
  let repository: Repository<Member>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        name: 'John Doe',
      };
      const member = { id: 1, ...createMemberDto };

      mockRepository.create.mockReturnValue(member);
      mockRepository.save.mockResolvedValue(member);

      const result = await service.create(createMemberDto);

      expect(repository.create).toHaveBeenCalledWith(createMemberDto);
      expect(repository.save).toHaveBeenCalledWith(member);
      expect(result).toEqual(member);
    });
  });

  describe('findAll', () => {
    it('should return an array of members', async () => {
      const members = [{ id: 1, name: 'John Doe' }];
      mockRepository.find.mockResolvedValue(members);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(members);
    });
  });

  describe('findOne', () => {
    it('should return a member by ID', async () => {
      const member = { id: 1, name: 'John Doe' };
      mockRepository.findOneBy.mockResolvedValue(member);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(member);
    });

    it('should throw an exception if member not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(HttpException);
      await expect(service.findOne(1)).rejects.toThrow('Member Not Found');
    });
  });

  describe('update', () => {
    it('should update and save an existing member', async () => {
      const updateMemberDto: UpdateMemberDto = { name: 'Updated User' };
      const existingMember = { id: 1, name: 'Updated User' };
      const updatedMember = { ...existingMember, ...updateMemberDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingMember);
      mockRepository.merge.mockReturnValue(updatedMember);
      mockRepository.save.mockResolvedValue(updatedMember);

      const result = await service.update(1, updateMemberDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.merge).toHaveBeenCalledWith(
        existingMember,
        updateMemberDto,
      );
      expect(repository.save).toHaveBeenCalledWith(updatedMember);
      expect(result).toEqual(updatedMember);
    });
  });

  describe('remove', () => {
    it('should soft remove an existing member', async () => {
      const member = { id: 1, name: 'John Doe' };

      jest.spyOn(service, 'findOne').mockResolvedValue(member);
      mockRepository.softRemove.mockResolvedValue(member);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.softRemove).toHaveBeenCalledWith(member);
      expect(result).toEqual(member);
    });
  });
});
