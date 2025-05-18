import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly _prismaService: PrismaService) {}
  async createUser(createUserInput: Prisma.UserCreateInput) {
    return this._prismaService.user.create({
      data: {
        ...createUserInput,
        password: await hash(createUserInput.password, 10),
      },
    });
  }

  async getUsers() {
    return this._prismaService.user.findMany();
  }

  async getUser(args: Prisma.UserWhereUniqueInput) {
    return this._prismaService.user.findUniqueOrThrow({
      where: args,
    });
  }
}
