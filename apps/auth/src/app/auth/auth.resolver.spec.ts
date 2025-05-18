import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { User } from '../users/models/user.model';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthService.login and return a user', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        userId: 1,
        email: loginInput.email,
        phone: '1234567890',
        username: 'testuser',
        role: 'user',
        id: 1,
      } as User;

      const mockResponse = {};

      (authService.login as jest.Mock).mockResolvedValue(mockUser);

       
      const result = await resolver.login(loginInput, {
        res: mockResponse,
      } as any);

      expect(authService.login).toHaveBeenCalledWith(loginInput, mockResponse);
      expect(result).toEqual(mockUser);
    });
  });
});
