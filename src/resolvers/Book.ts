import { Book } from "../entities/Book";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Author } from "./../entities/Author";
import { BookItem } from "./../entities/BookItem";
import { isAuth } from "./../middleware/isAuth";
import { isLibrarian } from "./../middleware/isLibrarian";

@InputType()
class BookInputType {
  @Field()
  isbnNumber!: number;

  @Field()
  rackNumber!: string;

  @Field(() => Int)
  bookItemId!: number;
}

@InputType()
class BookItemInputType {
  @Field()
  title!: string;

  @Field(() => Int)
  authorId!: number;

  @Field()
  category!: string;

  @Field()
  edition!: string;
}

@Resolver()
export class BookResolver {
  @Query(() => [BookItem])
  bookItem() {
    return BookItem.find({ relations: ["author", "books"] });
  }

  @Query(() => [Book])
  books() {
    return Book.find({ relations: ["bookItem"] });
  }

  @Mutation(() => BookItem)
  async addBookItem(
    @Arg("bookItemInput") bookItemInputType: BookItemInputType
  ): Promise<BookItem | null> {
    const author = await Author.findOne(bookItemInputType.authorId);

    const bookItem = await BookItem.create({
      author: author,
      category: bookItemInputType.category,
      edition: bookItemInputType.edition,
      title: bookItemInputType.title,
      publicationDate: new Date(),
    }).save();

    return bookItem;
  }

  @UseMiddleware(isAuth)
  @UseMiddleware(isLibrarian)
  @Mutation(() => BookItem)
  async addCopiesOfBookToLibrary(
    @Arg("bookInput") bookInput: BookInputType
  ): Promise<BookItem | null | undefined> {
    const bookItem = await BookItem.findOne(bookInput.bookItemId, {
      relations: ["books"],
    });
    console.log("BookResolver -> bookItem", bookItem);

    const book = await Book.create({
      isbnNumber: bookInput.isbnNumber,
      rackNumber: bookInput.rackNumber,
      bookItem: bookItem,
    }).save();

    bookItem?.books.push(book);
    console.log("BookResolver -> bookItem", bookItem);

    if (bookItem) {
      await getConnection()
        .createQueryBuilder()
        .update(BookItem)
        .set({
          books: bookItem.books,
        })
        .where("id = :id", { id: bookInput.bookItemId })
        .execute()
        .catch((err) => console.log(err));
    } else {
      return null;
    }

    const bookItemm = BookItem.findOne(bookInput.bookItemId, {
      relations: ["books"],
    });

    return bookItemm;
  }
}
