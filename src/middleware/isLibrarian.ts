import { MiddlewareFn } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "./../types/MyContext";

export const isLibrarian: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const user = await User.findOne(context.req.userId);

  if (!user?.isLibrarian) {
    throw new Error("not a admin");
  }

  return next();
};
