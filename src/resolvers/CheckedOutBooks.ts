import dayjs from "dayjs";
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Book } from "../entities/Book";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/MyContext";
import { CheckedOutBooks } from "./../entities/CheckedOutBooks";

@ObjectType()
class IssuedBookForCurrentUser {
  @Field()
  id: number;

  @Field(() => String)
  createdAt: Date;

  @Field()
  returnDate: Date;

  @Field({ nullable: true })
  returnedDate: Date;

  @Field(() => Int)
  fine: number;

  @Field()
  title: string;
}

@Resolver()
export class CheckedOutBooksResolver {
  @Query(() => [CheckedOutBooks])
  checkedOutBooks() {
    return CheckedOutBooks.find({ relations: ["issuedBy", "issuedBook"] });
  }

  @Mutation(() => CheckedOutBooks)
  @UseMiddleware(isAuth)
  async borrowBook(
    @Arg("bookISBN", () => Int) bookISBN: number,
    @Ctx() { req }: MyContext
  ): Promise<CheckedOutBooks | boolean> {
    const book = await Book.findOne({
      where: {
        isbnNumber: bookISBN,
      },
    });
    const user = await User.findOne(req.userId);
    let checkOutBook;
    if (book) {
      checkOutBook = CheckedOutBooks.create({
        issuedBy: user,
        issuedBook: book,
        returnDate: dayjs(new Date()).add(7, "day").toDate(),
      }).save();
    } else {
      return false;
    }

    return checkOutBook;
  }

  @Query(() => [IssuedBookForCurrentUser])
  @UseMiddleware(isAuth)
  async issuedBookForCurrentUser(
    @Ctx() { req }: MyContext
  ): Promise<IssuedBookForCurrentUser[]> {
    const user = await User.findOne(req.userId);

    let checkOutBook;
    if (user) {
      checkOutBook = await getConnection().query(
        `
        SELECT cbook.*,
          (SELECT title
            FROM book_item
              WHERE book_item."id" = book."bookItemId") "title"
          FROM checked_out_books AS cbook
            LEFT JOIN
              (SELECT book.*
                FROM book
                  LEFT JOIN book_item ON book_item.id = book."bookItemId") AS book
                    ON cbook."issuedBookId" = book."id"
          LEFT JOIN "user" 
            ON "user".id = cbook."issuedById"
          WHERE cbook."issuedById" = $1
          ORDER BY cbook."createdAt" DESC
        `,
        [user.id]
      );
    }

    return checkOutBook;
  }
}
