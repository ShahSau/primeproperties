import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../users/models/user.model';
import { LoginInput } from './dto/login.input';
import { GqlContext } from '@primeproperties/nestjs';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly _authService: AuthService) {}
  @Mutation(() => User)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: GqlContext
  ) {
    return this._authService.login(loginInput, context.res);
  }
}
