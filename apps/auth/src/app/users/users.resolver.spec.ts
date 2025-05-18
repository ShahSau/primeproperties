import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './models/user.model';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      getUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'securepassword',
        phone: '1234567890',
        username: 'testuser',
        role: 'user',
      };

      const mockUser: User = {
        id: 1,
        email: input.email,
        phone: input.phone,
        username: input.username,
        role: input.role,
      } as User;

      (usersService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await resolver.createUser(input);

      expect(usersService.createUser).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'user1@example.com',
          phone: '1111111',
          username: 'user1',
          role: 'tenant',
        } as User,
        {
          id: 2,
          email: 'user2@example.com',
          phone: '1222111111',
          username: 'user122',
          role: 'tenant',
        } as User,
      ];

      (usersService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await resolver.getUsers();

      expect(usersService.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
