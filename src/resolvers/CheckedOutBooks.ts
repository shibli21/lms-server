import { Query, Resolver } from "type-graphql";
import { CheckedOutBooks } from "./../entities/CheckedOutBooks";

@Resolver()
export class CheckedOutBooksResolver {
  @Query(() => [CheckedOutBooks])
  checkedOutBooks() {
    return CheckedOutBooks.find({ relations: ["issuedBy", "issuedBook"] });
  }
}
