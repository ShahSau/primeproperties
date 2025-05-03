import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/auth'
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService:PrismaService) {}
    async createUser(createUserInput: Prisma.UserCreateInput) {
        return this.prismaService.user.create({
            data: {
                ...createUserInput,
                password: await hash(createUserInput.password, 10),
            },
        });
    }

    async getUsers() {
        return this.prismaService.user.findMany();
    }
}
