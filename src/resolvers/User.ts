import { CheckedOutBooks } from "./../entities/CheckedOutBooks";
import { isAuth } from "./../middleware/isAuth";
import { Book } from "./../entities/Book";
import { hash, verify } from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { User } from "./../entities/User";
import { MyContext } from "./../types/MyContext";
import { UserInputType } from "./../utils/UserInput";
import { validateRegister } from "./../utils/validateRegister";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.userId) {
      return null;
    }
    const user = await User.findOne(req.userId);
    return user;
  }

  @Query(() => [User])
  async users() {
    return User.find();
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInputType,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await hash(options.password);
    const emailToLower = options.email.toLowerCase();

    let user;
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          studentId: options.studentId,
          username: options.name,
          email: emailToLower,
          password: hashedPassword,
          isLibrarian: true,
        })
        .execute();

      user = await User.findOne({ where: { email: options.email } });

      const token = jwt.sign({ userId: user?.id }, `${process.env.JWT_SECRET}`);
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 100000000,
      });
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "already exists ",
            },
          ],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ email: email });
    if (!user) {
      return { errors: [{ field: "email", message: "user doesn't exists" }] };
    }

    const valid = await verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password incorrect",
          },
        ],
      };
    }

    const token = jwt.sign({ userId: user?.id }, `${process.env.JWT_SECRET}`);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 100000000000,
    });

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { res }: MyContext) {
    res.clearCookie("token");
    return true;
  }

  @Mutation(() => CheckedOutBooks)
  @UseMiddleware(isAuth)
  async borrowBook(
    @Arg("bookId") bookId: number,
    @Ctx() { req }: MyContext
  ): Promise<CheckedOutBooks | boolean> {
    const book = await Book.findOne(bookId);
    const user = await User.findOne(req.userId);
    let checkOutBook;
    if (book) {
      checkOutBook = CheckedOutBooks.create({
        issuedBy: user,
        issuedBook: book,
        returnDate: dayjs(new Date()).add(7, "day"),
      }).save();
    } else {
      return false;
    }

    return checkOutBook;
  }
}
