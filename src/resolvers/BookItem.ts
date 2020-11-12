import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Author } from "./../entities/Author";
import { BookItem } from "./../entities/BookItem";

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
export class BookItemResolver {
  @Query(() => BookItem)
  bookItem(@Arg("id", () => Int) id: number) {
    return BookItem.findOne(id, { relations: ["author", "books"] });
  }

  @Query(() => [BookItem])
  bookItems() {
    return BookItem.find({ relations: ["author", "books"] });
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
}
