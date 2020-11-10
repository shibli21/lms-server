import dayjs from "dayjs";
import { Book } from "../entities/Book";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/MyContext";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { CheckedOutBooks } from "./../entities/CheckedOutBooks";

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
}
