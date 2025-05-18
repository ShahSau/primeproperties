import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { hash as bcryptHash } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and create a user', async () => {
      const input = {
        email: 'test@example.com',
        password: 'plainPassword',
        name: 'Test User',
        phone: '1234567890',
        username: 'testuser',
        role: 'Tenant',
      };

      const hashedPassword = 'hashedPassword123';
      (bcryptHash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = { id: 1, email: input.email };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(input);

      expect(bcryptHash).toHaveBeenCalledWith(input.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...input,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUser', () => {
    it('should return a single user by unique input', async () => {
      const mockUser = { id: '1', email: 'unique@example.com' };
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      const result = await service.getUser({ email: 'unique@example.com' });

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'unique@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
