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
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/MyContext";
import { Book } from "./../entities/Book";
import { CheckedOutBooks } from "./../entities/CheckedOutBooks";
import { FieldError } from "./../utils/FieldErrorType";

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

  @Field()
  isbnNumber: number;
}

@ObjectType()
class IssueBookResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => CheckedOutBooks, { nullable: true })
  checkOutBook?: CheckedOutBooks;
}

@Resolver()
export class CheckedOutBooksResolver {
  @Query(() => [CheckedOutBooks])
  checkedOutBooks() {
    return CheckedOutBooks.find({ relations: ["issuedBy", "issuedBook"] });
  }

  @Mutation(() => IssueBookResponse)
  @UseMiddleware(isAuth)
  async borrowBook(
    @Arg("bookISBN", () => Int) bookISBN: number,
    @Ctx() { req }: MyContext
  ): Promise<IssueBookResponse> {
    // check if the book is valid
    const book = await Book.findOne({
      relations: ["bookItem"],
      where: {
        isbnNumber: bookISBN,
        status: true,
      },
    });

    if (!book) {
      return {
        errors: [
          {
            field: "book",
            message: "Book Not Available",
          },
        ],
      };
    }

    const user = await User.findOne(req.userId);

    // check if user issued the book previously and returned it
    const issuebookpreviouslyandnotreturned: Array<any> = await getConnection().query(
      `
        SELECT cbook.*
          FROM checked_out_books AS cbook
            WHERE cbook."issuedById" = $1
                  AND cbook."issuedBookId" = $2
                  AND cbook."returnedDate" IS NULL
            ORDER BY cbook."createdAt" DESC
        `,
      [user?.id, book?.bookItem.id]
    );

    if (issuebookpreviouslyandnotreturned.length !== 0) {
      return {
        errors: [
          {
            field: "book",
            message: "not returned previously issued book",
          },
        ],
      };
    }
    // check if user can issue new book
    if (user && user.numberOfBooksCheckedOut > 1000) {
      return {
        errors: [
          {
            field: "book",
            message: "You can't issue any more books",
          },
        ],
      };
    }

    // increase the number of issued books for that user
    const updatedUser = await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({ numberOfBooksCheckedOut: user?.numberOfBooksCheckedOut! + 1 })
      .where("id = :id", { id: req.userId })
      .returning("*")
      .execute();

    //Update book status
    await getConnection()
      .createQueryBuilder()
      .update(Book)
      .set({ status: false })
      .where("id = :id", { id: book?.id })
      .execute();

    let checkOutBook;
    if (book) {
      let cb = await CheckedOutBooks.create({
        issuedBook: book,
        issuedBy: updatedUser.raw[0],
        returnDate: dayjs(new Date()).add(7, "day").toDate(),
      }).save();
      checkOutBook = await CheckedOutBooks.findOne(cb.id, {
        relations: ["issuedBy", "issuedBook"],
      });
    } else {
      return {
        errors: [
          {
            field: "book",
            message: "error 404!",
          },
        ],
      };
    }

    return { checkOutBook };
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
        SELECT cbook.*,book."isbnNumber",
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

  @Mutation(() => IssueBookResponse)
  @UseMiddleware(isAuth)
  async returnBook(
    @Arg("bookISBN", () => Int) bookISBN: number,
    @Ctx() { req }: MyContext
  ): Promise<IssueBookResponse> {
    const book = await Book.findOne({
      where: {
        isbnNumber: bookISBN,
      },
      relations: ["bookItem"],
    });

    const cb = await CheckedOutBooks.findOne({
      relations: ["issuedBy", "issuedBook"],
      where: {
        issuedBook: book?.id,
        issuedBy: req.userId,
        returnedDate: null,
      },
    });

    if (!cb) {
      return {
        errors: [
          {
            field: "isbn",
            message: "no such book",
          },
        ],
      };
    }

    const checkOutBook = await getConnection()
      .createQueryBuilder()
      .update(CheckedOutBooks)
      .set({ returnedDate: new Date() })
      .where(`id = :id`, { id: cb?.id })
      .returning("*")
      .execute();

    await getConnection()
      .createQueryBuilder()
      .update(Book)
      .set({ status: true })
      .where(`id = :id`, { id: book?.id })
      .execute();

    return {
      checkOutBook: checkOutBook.raw[0],
    };
  }
}
