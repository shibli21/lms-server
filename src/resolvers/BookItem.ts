import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Author } from "./../entities/Author";
import { BookItem } from "./../entities/BookItem";

@ObjectType()
class PaginatedBookItems {
  @Field(() => [BookItem])
  bookItems: BookItem[];

  @Field()
  hasMore: boolean;
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

@InputType()
class SearchBooksInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset?: number;
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

  @Query(() => PaginatedBookItems)
  async paginatedBookItems(
    @Arg("input") { title, author, category, limit, offset }: SearchBooksInput
  ): Promise<PaginatedBookItems> {
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    let booksQB = getConnection()
      .getRepository(BookItem)
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.books", "book")
      .leftJoinAndSelect("b.author", "author")
      .orderBy(`b.id`, "ASC");

    if (title) {
      booksQB = booksQB.andWhere(`"b"."title" ilike :title`, {
        title: `%${title}%`,
      });
    }
    if (author) {
      booksQB = booksQB.andWhere(`"author"."authorName" ilike :author`, {
        author: `%${author}%`,
      });
    }

    if (category) {
      booksQB = booksQB.andWhere(`"b"."category" ilike :category`, {
        category: `%${category}%`,
      });
    }

    const bi = await booksQB.take(reaLimitPlusOne).skip(offset).getMany();

    return {
      bookItems: bi.slice(0, realLimit),
      hasMore: bi.length === reaLimitPlusOne,
    };
  }
}
