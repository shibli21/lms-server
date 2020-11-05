import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Author } from "./../entities/Author";
import { isAuth } from "./../middleware/isAuth";
import { isLibrarian } from "./../middleware/isLibrarian";

@Resolver()
export class AuthorResolver {
  @Query(() => [Author])
  authors() {
    return Author.find({
      relations: ["books"],
    });
  }

  @UseMiddleware(isAuth)
  @UseMiddleware(isLibrarian)
  @Mutation(() => Author)
  async addAuthorToLibrary(
    @Arg("name") name: string,
    @Arg("description") description: string
  ): Promise<Author> {
    const author = await Author.create({
      authorName: name,
      description: description,
    }).save();

    return author;
  }
}
