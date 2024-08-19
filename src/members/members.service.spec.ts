import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { HttpException } from '@nestjs/common';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberDTO } from './dto/member.dto';
import { BorrowsService } from '../borrows/borrows.service';
import { CreateBorrowDto } from '../borrows/dto/create-borrow.dto';

describe('MembersService', () => {
  let service: MembersService;
  let repository: Repository<Member>;
  let borrowsService: BorrowsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockBorrowsService = {
    findByMember: jest.fn(),
    borrowBook: jest.fn(),
    returnBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
        {
          provide: BorrowsService,
          useValue: mockBorrowsService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    borrowsService = module.get<BorrowsService>(BorrowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(borrowsService).toBeDefined();
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
      const members = [{ id: 1, name: 'John Doe', borrowedBooks: [] }];
      mockRepository.find.mockResolvedValue(members);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(members.map((member) => new MemberDTO(member)));
    });
  });

  describe('findOne', () => {
    it('should return a member by ID', async () => {
      const member = { id: 1, name: 'John Doe', borrowedBooks: [] };
      mockRepository.findOne.mockResolvedValue(member);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['borrowedBooks', 'borrowedBooks.book'],
      });
      expect(result).toEqual(new MemberDTO(member));
    });

    it('should throw an exception if member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(HttpException);
      await expect(service.findOne(1)).rejects.toThrow('Member Not Found');
    });
  });

  describe('update', () => {
    it('should update and save an existing member', async () => {
      const updateMemberDto: UpdateMemberDto = { name: 'Updated User' };
      const existingMember = { id: 1, name: 'John Doe', borrowedBooks: [] };
      const updatedMember = { ...existingMember, ...updateMemberDto };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(new MemberDTO(existingMember));

      mockRepository.merge.mockReturnValue(updatedMember);
      mockRepository.save.mockResolvedValue(updatedMember);

      const result = await service.update(1, updateMemberDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.merge).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingMember.id,
          name: existingMember.name,
        }),
        updateMemberDto,
      );
      expect(repository.save).toHaveBeenCalledWith(updatedMember);
      expect(result).toEqual(updatedMember);
    });
  });

  describe('remove', () => {
    it('should soft remove an existing member', async () => {
      const member = { id: 1, name: 'John Doe', borrowedBooks: [] };

      jest.spyOn(service, 'findOne').mockResolvedValue(new MemberDTO(member));
      mockRepository.softRemove.mockResolvedValue(member);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({
          id: member.id,
          name: member.name,
          borrowedBooks: member.borrowedBooks,
        }),
      );
      expect(result).toEqual(member);
    });
  });

  describe('getBorrowedBooks', () => {
    it('should return borrowed books for a member', async () => {
      const memberId = 1;
      const member = { id: memberId, name: 'John Doe', borrowedBooks: [] };
      const borrowedBooks = [{ id: 1, book: { id: 1, title: 'Book Title' } }];

      mockRepository.findOne.mockResolvedValue(member);
      mockBorrowsService.findByMember.mockResolvedValue(borrowedBooks);

      const result = await service.getBorrowedBooks(memberId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: memberId },
        relations: ['borrowedBooks', 'borrowedBooks.book'],
      });
      expect(borrowsService.findByMember).toHaveBeenCalledWith(memberId);
      expect(result).toEqual(borrowedBooks);
    });
  });

  describe('addBorrowedBooks', () => {
    it('should add a borrowed book for a member', async () => {
      const memberId = 1;
      const createBorrowDto: CreateBorrowDto = { bookId: 1 };
      const borrow = { id: 1, memberId, bookId: 1, borrowDate: new Date() };
      mockBorrowsService.borrowBook.mockResolvedValue(borrow);

      const result = await service.addBorrowedBooks(memberId, createBorrowDto);

      expect(borrowsService.borrowBook).toHaveBeenCalledWith(
        memberId,
        createBorrowDto.bookId,
      );
      expect(result).toEqual(borrow);
    });
  });

  describe('returnBorrowedBooks', () => {
    it('should return a borrowed book for a member', async () => {
      const memberId = 1;
      const bookId = 1;

      const existingMember = {
        id: memberId,
        name: 'John Doe',
        borrowedBooks: [],
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(new MemberDTO(existingMember));

      const borrow = {
        id: 1,
        memberId,
        bookId,
        borrowDate: new Date(),
        returnDate: new Date(),
      };
      mockBorrowsService.returnBook.mockResolvedValue(borrow);

      const result = await service.returnBorrowedBooks(memberId, bookId);

      expect(service.findOne).toHaveBeenCalledWith(memberId);
      expect(borrowsService.returnBook).toHaveBeenCalledWith(memberId, bookId);
      expect(result).toEqual(borrow);
    });
  });
});
