import jwt from "jsonwebtoken";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Author } from "./entities/Author";
import { Book } from "./entities/Book";
import { CheckedOutBooks } from "./entities/CheckedOutBooks";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/User";
import { MyContext } from "./types/MyContext";
import { config } from "dotenv";

config();

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5433,
    password: "root",
    username: "postgres",
    database: "library",
    synchronize: true,
    logging: true,
    entities: [Author, Book, CheckedOutBooks, User],
  });

  const app = express();

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(cookieParser());

  // ** middleware for getting the userId from cookies
  app.use((req, _, next) => {
    const token = req.cookies["token"];
    try {
      const response = jwt.verify(token, `${process.env.JWT_SECRET}`) as any;
      (req as any).userId = response.userId;
    } catch {}
    next();
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`graphql server : http://localhost:${port}/graphql`);
  });
};

main();
