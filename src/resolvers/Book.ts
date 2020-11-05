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
import { Author } from "./../entities/Author";
import { Book } from "./../entities/Book";
import { isAuth } from "./../middleware/isAuth";
import { isLibrarian } from "./../middleware/isLibrarian";

@InputType()
class BookInputType {
  @Field()
  isbnNumber!: number;

  @Field()
  title!: string;

  @Field(() => Int)
  authorId: number;
}

@Resolver()
export class BookResolver {
  @Query(() => [Book])
  books() {
    return Book.find({ relations: ["author"] });
  }

  @UseMiddleware(isAuth)
  @UseMiddleware(isLibrarian)
  @Mutation(() => Book)
  async addBookToLibrary(
    @Arg("bookInput") bookInput: BookInputType
  ): Promise<Book> {
    const author = await Author.findOne(bookInput.authorId);

    const book = await Book.create({
      isbnNumber: bookInput.isbnNumber,
      title: bookInput.title,
      author: author,
    }).save();

    return book;
  }
}
