import { Field, InputType } from "type-graphql";

@InputType()
export class UserInputType {
  @Field()
  studentId!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}
