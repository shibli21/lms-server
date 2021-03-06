import { FieldError } from "./../utils/FieldErrorType";
import { BookItem } from "../entities/BookItem";
import { isAuth } from "../middleware/isAuth";
import { isLibrarian } from "../middleware/isLibrarian";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Book } from "../entities/Book";

@InputType()
class BookInputType {
  @Field()
  isbnNumber!: number;

  @Field()
  rackNumber!: string;

  @Field(() => Int)
  bookItemId!: number;
}

@ObjectType()
class AddCopiesOfBookToLibraryResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Book, { nullable: true })
  book?: Book;
}

@Resolver()
export class BookResolver {
  @Query(() => [Book])
  books() {
    return Book.find({ relations: ["bookItem"] });
  }

  @UseMiddleware(isAuth)
  @UseMiddleware(isLibrarian)
  @Mutation(() => AddCopiesOfBookToLibraryResponse)
  async addCopiesOfBookToLibrary(
    @Arg("bookInput") bookInput: BookInputType
  ): Promise<AddCopiesOfBookToLibraryResponse> {
    const bookItem = await BookItem.findOne({
      where: {
        id: bookInput.bookItemId,
      },
      relations: ["books", "author"],
    });

    if (!bookItem) {
      return {
        errors: [
          {
            field: "bookItem",
            message: "Book item is not available",
          },
        ],
      };
    }

    const isbn = await Book.findOne({
      where: {
        isbnNumber: bookInput.isbnNumber,
      },
    });

    if (isbn) {
      return {
        errors: [
          {
            field: "isbn",
            message: "Already a book in the library with that ISBN number",
          },
        ],
      };
    }

    //create book
    await Book.create({
      isbnNumber: bookInput.isbnNumber,
      rackNumber: bookInput.rackNumber,
      bookItem: bookItem,
    }).save();

    //increase number of copies
    await getConnection()
      .createQueryBuilder()
      .update(BookItem)
      .set({
        numberOfCopies: bookItem.numberOfCopies + 1,
      })
      .where("id = :id", { id: bookInput.bookItemId })
      .execute();

    return {
      book: await Book.findOne({
        where: { isbnNumber: bookInput.isbnNumber },
        relations: ["bookItem"],
      }),
    };
  }
}
