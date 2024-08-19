import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { BorrowsService } from '../borrows/borrows.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { CreateBorrowDto } from '../borrows/dto/create-borrow.dto';
import { HttpException } from '@nestjs/common';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;
  let borrowsService: BorrowsService;
  let repository: Repository<Member>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto: CreateMemberDto) => ({
      id: Date.now(),
      ...dto,
    })),
    save: jest.fn().mockImplementation((member) => Promise.resolve(member)),
    find: jest.fn().mockResolvedValue([{ id: 1, name: 'John Doe' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'John Doe' }),
    merge: jest.fn(),
    softRemove: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockBorrowsService = {
    findByMember: jest.fn().mockResolvedValue([{ id: 1, title: 'Book Title' }]),
    borrowBook: jest.fn().mockResolvedValue(undefined),
    returnBook: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        BorrowsService,
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

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
    borrowsService = module.get<BorrowsService>(BorrowsService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));

    jest
      .spyOn(service, 'create')
      .mockImplementation(async (dto: CreateMemberDto) => {
        const member = mockRepository.create(dto);
        return mockRepository.save(member);
      });

    jest.spyOn(service, 'findAll').mockResolvedValue(mockRepository.find());

    jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
      const member = await mockRepository.findOne({ where: { id } });
      if (!member) throw new HttpException('Member Not Found', 404);
      return member;
    });

    jest
      .spyOn(service, 'update')
      .mockImplementation(async (id: number, dto: UpdateMemberDto) => {
        const existingMember = await service.findOne(id);
        const updatedMember = mockRepository.merge(existingMember, dto);
        return mockRepository.save(updatedMember);
      });

    jest.spyOn(service, 'remove').mockImplementation(async (id: number) => {
      const member = await service.findOne(id);
      return mockRepository.softRemove(member);
    });

    jest.spyOn(borrowsService, 'findByMember').mockResolvedValue([
      {
        id: 1,
        member: {
          id: 1,
          name: 'John Doe',
          borrowedBooks: [],
        },
        book: {
          id: 1,
          title: 'Book Title',
          author: 'Author Name',
          code: 'JT-23',
          stock: 1,
          borrows: [],
        },
        borrowDate: new Date(),
        returnDate: null,
      },
    ]);
    jest.spyOn(borrowsService, 'borrowBook').mockResolvedValue(undefined);
    jest.spyOn(borrowsService, 'returnBook').mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(borrowsService).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should create a member', async () => {
    const dto: CreateMemberDto = { name: 'John Doe' };
    await expect(controller.create(dto)).resolves.toEqual({
      success: true,
      message: 'Member Created Successfully',
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all members', async () => {
    await expect(controller.findAll()).resolves.toEqual({
      success: true,
      data: [{ id: 1, name: 'John Doe' }],
      message: 'Member Fetched Successfully',
    });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one member', async () => {
    await expect(controller.findOne('1')).resolves.toEqual({
      success: true,
      data: { id: 1, name: 'John Doe' },
      message: 'Member Fetched Successfully',
    });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a member', async () => {
    const dto: UpdateMemberDto = { name: 'New User Update' };
    await expect(controller.update('1', dto)).resolves.toEqual({
      success: true,
      message: 'Member Updated Successfully',
    });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a member', async () => {
    await expect(controller.remove('1')).resolves.toEqual({
      success: true,
      message: 'Member Deleted Successfully',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should get borrowed books for a member', async () => {
    await expect(controller.getBorrowedBooks('1')).resolves.toEqual({
      success: true,
      data: [
        {
          id: 1,
          member: {
            id: 1,
            name: 'John Doe',
            borrowedBooks: [],
          },
          book: {
            author: 'Author Name',
            borrows: [],
            code: 'JT-23',
            id: 1,
            stock: 1,
            title: 'Book Title',
          },
          borrowDate: new Date(),
          returnDate: null,
        },
      ],
      message: 'Member Book Fetched Successfully',
    });
    expect(borrowsService.findByMember).toHaveBeenCalledWith(1);
  });

  it('should add borrowed books for a member', async () => {
    const dto: CreateBorrowDto = { bookId: 1 };
    await expect(controller.addBorrowedBooks('1', dto)).resolves.toEqual({
      success: true,
      message: 'Book borrowed successfully',
    });
    expect(borrowsService.borrowBook).toHaveBeenCalledWith(1, dto.bookId);
  });

  it('should return borrowed books for a member', async () => {
    await expect(controller.returnBorrowedBooks('1', '1')).resolves.toEqual({
      success: true,
      message: 'Book Return Successfully',
    });
    expect(borrowsService.returnBook).toHaveBeenCalledWith(1, 1);
  });
});
