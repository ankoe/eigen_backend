import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;
  let repository: Repository<Book>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto: CreateBookDto) => ({
      id: Date.now(),
      ...dto,
    })),
    save: jest.fn().mockImplementation((book) => Promise.resolve(book)),
    find: jest.fn().mockResolvedValue([
      {
        id: 1,
        code: 'JK-234',
        title: 'New Book',
        author: 'Author',
        stock: 1,
      },
    ]),
    findOneBy: jest.fn().mockResolvedValue({
      id: 1,
      code: 'JK-234',
      title: 'New Book',
      author: 'Author',
      stock: 1,
    }),
    merge: jest.fn(),
    softRemove: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));

    jest
      .spyOn(service, 'create')
      .mockImplementation(async (dto: CreateBookDto) => {
        const book = mockRepository.create(dto);
        return mockRepository.save(book);
      });

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => mockRepository.find());

    jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
      const book = await mockRepository.findOneBy({ id });
      if (!book) {
        throw new Error('Book Not Found');
      }
      return book;
    });

    jest
      .spyOn(service, 'update')
      .mockImplementation(async (id: number, dto: UpdateBookDto) => {
        const existingBook = await service.findOne(id);
        const updatedBook = mockRepository.merge(existingBook, dto);
        return mockRepository.save(updatedBook);
      });

    jest.spyOn(service, 'remove').mockImplementation(async (id: number) => {
      const book = await service.findOne(id);
      return mockRepository.softRemove(book);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should create a book', async () => {
    const dto: CreateBookDto = {
      code: 'JK-234',
      title: 'New Book',
      author: 'Author',
      stock: 1,
    };
    expect(await controller.create(dto)).toEqual({
      success: true,
      message: 'Book Created Successfully',
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all books', async () => {
    expect(await controller.findAll()).toEqual({
      success: true,
      data: [
        {
          id: 1,
          code: 'JK-234',
          title: 'New Book',
          author: 'Author',
          stock: 1,
        },
      ],
      message: 'Book Fetched Successfully',
    });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one book', async () => {
    expect(await controller.findOne('1')).toEqual({
      success: true,
      data: {
        id: 1,
        code: 'JK-234',
        title: 'New Book',
        author: 'Author',
        stock: 1,
      },
      message: 'Book Fetched Successfully',
    });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a book', async () => {
    const dto: UpdateBookDto = { title: 'Updated Book' };
    expect(await controller.update('1', dto)).toEqual({
      success: true,
      message: 'Book Updated Successfully',
    });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a book', async () => {
    expect(await controller.remove('1')).toEqual({
      success: true,
      message: 'Book Deleted Successfully',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
