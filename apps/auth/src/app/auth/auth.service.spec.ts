/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      getUser: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test'),
      getOrThrow: jest.fn().mockReturnValue('3600000'), // 1 hour in ms
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate and set cookie', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      const loginInput = {
        email: mockUser.email,
        password: 'password123',
      };

      const mockRes = {
        cookie: jest.fn(),
      };

      (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginInput, mockRes as any);

      expect(usersService.getUser).toHaveBeenCalledWith({
        email: loginInput.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'Authentication',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // change based on NODE_ENV
          expires: expect.any(Date),
        })
      );
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login(
          { email: mockUser.email, password: 'wrongpassword' },
          {} as any
        )
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.getUser as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        service.login(
          { email: 'unknown@example.com', password: 'pass' },
          {} as any
        )
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
