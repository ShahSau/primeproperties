import { AbstractModel } from '@primeproperties/nestjs';
import { Field, ObjectType } from '@nestjs/graphql';


@ObjectType()
export class User extends AbstractModel {
  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  username: string;
  
  @Field()
  role: string;
}
