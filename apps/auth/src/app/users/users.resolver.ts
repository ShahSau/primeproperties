import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly _userService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this._userService.createUser(createUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this._userService.getUsers();
  }
}
