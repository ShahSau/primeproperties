import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService
  ) {}

  async login({ email, password }: LoginInput, response: Response) {
    const user = await this._verifyUser(email, password);
    const expires = new Date();
    expires.setMilliseconds(
      expires.getTime() +
        parseInt(this._configService.getOrThrow('JWT_EXPIRATION_MS'))
    );
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const accessToken = this._jwtService.sign(tokenPayload);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this._configService.get('NODE_ENV') === 'production',
      expires,
    });
    return user;
  }

  private async _verifyUser(email: string, password: string) {
    try {
      const user = await this._usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
