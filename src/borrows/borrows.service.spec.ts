import { Test, TestingModule } from '@nestjs/testing';
import { BorrowsService } from './borrows.service';
import { Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { Member } from '../members/entities/member.entity';
import { Book } from '../books/entities/book.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';

describe('BorrowsService', () => {
  let service: BorrowsService;
  let borrowRepository: Repository<Borrow>;
  let memberRepository: Repository<Member>;
  let bookRepository: Repository<Book>;

  const mockBorrowRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockBookRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowsService,
        {
          provide: getRepositoryToken(Borrow),
          useValue: mockBorrowRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    service = module.get<BorrowsService>(BorrowsService);
    borrowRepository = module.get<Repository<Borrow>>(
      getRepositoryToken(Borrow),
    );
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(borrowRepository).toBeDefined();
    expect(memberRepository).toBeDefined();
    expect(bookRepository).toBeDefined();
  });

  describe('findByMember', () => {
    it('should return a list of borrowed books for a given member', async () => {
      const mockBorrows = [{ id: 1, book: { id: 1, title: 'Test Book' } }];
      mockBorrowRepository.find.mockResolvedValue(mockBorrows);

      const result = await service.findByMember(1);

      expect(borrowRepository.find).toHaveBeenCalledWith({
        where: { member: { id: 1 } },
        relations: ['book'],
      });
      expect(result).toEqual(mockBorrows);
    });
  });

  describe('borrowBook', () => {
    it('should successfully borrow a book', async () => {
      const mockMember = { id: 1, borrowedBooks: [] };
      const mockBook = { id: 1, borrows: [] };
      const mockBorrow = { id: 1, member: mockMember, book: mockBook };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBorrowRepository.create.mockReturnValue(mockBorrow);
      mockBorrowRepository.save.mockResolvedValue(mockBorrow);

      const result = await service.borrowBook(1, 1);

      expect(memberRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['borrowedBooks'],
      });
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['borrows'],
      });
      expect(borrowRepository.create).toHaveBeenCalledWith({
        member: mockMember,
        book: mockBook,
        borrowDate: expect.any(Date),
      });
      expect(borrowRepository.save).toHaveBeenCalledWith(mockBorrow);
      expect(result).toEqual(mockBorrow);
    });

    it('should throw an error if member or book is not found', async () => {
      mockMemberRepository.findOne.mockResolvedValue(null);
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.borrowBook(1, 1)).rejects.toThrow(HttpException);
      await expect(service.borrowBook(1, 1)).rejects.toThrow(
        'Member or book not found',
      );
    });

    it('should throw an error if member is penalized', async () => {
      const mockMember = {
        id: 1,
        borrowedBooks: [],
        penaltyEndDate: new Date(Date.now() + 86400000),
      };
      const mockBook = { id: 1, borrows: [] };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      await expect(service.borrowBook(1, 1)).rejects.toThrow(HttpException);
      await expect(service.borrowBook(1, 1)).rejects.toThrow(
        'Member is currently penalized',
      );
    });

    it('should throw an error if member has already borrowed 2 books', async () => {
      const mockMember = { id: 1, borrowedBooks: [{ id: 1 }, { id: 2 }] };
      const mockBook = { id: 1, borrows: [] };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      await expect(service.borrowBook(1, 1)).rejects.toThrow(HttpException);
      await expect(service.borrowBook(1, 1)).rejects.toThrow(
        'Member cannot borrow more than 2 books',
      );
    });

    it('should throw an error if the book is already borrowed', async () => {
      const mockMember = { id: 1, borrowedBooks: [] };
      const mockBook = { id: 1, borrows: [{ returnDate: null }] };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      await expect(service.borrowBook(1, 1)).rejects.toThrow(HttpException);
      await expect(service.borrowBook(1, 1)).rejects.toThrow(
        'Book is already borrowed',
      );
    });
  });

  describe('returnBook', () => {
    it('should successfully return a borrowed book', async () => {
      const mockMember = { id: 1, borrowedBooks: [] };
      const mockBook = { id: 1, borrows: [] };
      const mockBorrow = {
        id: 1,
        member: mockMember,
        book: mockBook,
        borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        returnDate: null,
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBorrowRepository.findOne.mockResolvedValue(mockBorrow);
      mockBorrowRepository.save.mockResolvedValue({
        ...mockBorrow,
        returnDate: new Date(),
      });

      const result = await service.returnBook(1, 1);

      expect(memberRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['borrowedBooks'],
      });
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['borrows'],
      });
      expect(borrowRepository.findOne).toHaveBeenCalledWith({
        where: { member: mockMember, book: mockBook, returnDate: null },
      });
      expect(borrowRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          returnDate: expect.any(Date),
        }),
      );
      expect(result).toEqual({ ...mockBorrow, returnDate: expect.any(Date) });
    });

    it('should return a message if the book was not borrowed by the member', async () => {
      const mockMember = { id: 1, borrowedBooks: [] };
      const mockBook = { id: 1, borrows: [] };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBorrowRepository.findOne.mockResolvedValue(null);

      const result = await service.returnBook(1, 1);

      expect(result).toEqual('This book was not borrowed by the member');
    });

    it('should penalize the member if the book is returned late', async () => {
      const mockMember = { id: 1, borrowedBooks: [], penaltyEndDate: null };
      const mockBook = { id: 1, borrows: [] };
      const mockBorrow = {
        id: 1,
        member: mockMember,
        book: mockBook,
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        returnDate: null,
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBorrowRepository.findOne.mockResolvedValue(mockBorrow);
      mockBorrowRepository.save.mockResolvedValue({
        ...mockBorrow,
        returnDate: new Date(),
      });
      mockMemberRepository.save.mockResolvedValue(mockMember);

      const result = await service.returnBook(1, 1);

      expect(memberRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          penaltyEndDate: expect.any(Date),
        }),
      );
      expect(result).toEqual({
        ...mockBorrow,
        returnDate: expect.any(Date),
      });
    });
  });
});
