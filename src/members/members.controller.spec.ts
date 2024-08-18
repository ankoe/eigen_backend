import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;
  let repository: Repository<Member>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto: CreateMemberDto) => ({
      id: Date.now(),
      ...dto,
    })),
    save: jest.fn().mockImplementation((member) => Promise.resolve(member)),
    find: jest.fn().mockResolvedValue([{ id: 1, name: 'John Doe' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: 1, name: 'John Doe' }),
    merge: jest.fn(),
    softRemove: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));

    // Mocking service methods
    jest
      .spyOn(service, 'create')
      .mockImplementation(async (dto: CreateMemberDto) => {
        const member = mockRepository.create(dto);
        return mockRepository.save(member);
      });

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => mockRepository.find());

    jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
      const member = await mockRepository.findOneBy({ id });
      if (!member) {
        throw new Error('Member Not Found');
      }
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should create a member', async () => {
    const dto: CreateMemberDto = {
      name: 'John Doe',
    };
    expect(await controller.create(dto)).toEqual({
      success: true,
      message: 'Member Created Successfully',
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all members', async () => {
    expect(await controller.findAll()).toEqual({
      success: true,
      data: [{ id: 1, name: 'John Doe' }],
      message: 'Member Fetched Successfully',
    });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one member', async () => {
    expect(await controller.findOne('1')).toEqual({
      success: true,
      data: { id: 1, name: 'John Doe' },
      message: 'Member Fetched Successfully',
    });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a member', async () => {
    const dto: UpdateMemberDto = { name: 'New User Update' };
    expect(await controller.update('1', dto)).toEqual({
      success: true,
      message: 'Member Updated Successfully',
    });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a member', async () => {
    expect(await controller.remove('1')).toEqual({
      success: true,
      message: 'Member Deleted Successfully',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
