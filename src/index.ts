import "reflect-metadata";
import { HelloResolver } from "./resolvers/Hello";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import cors from "cors";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5433,
    password: "root",
    username: "postgres",
    database: "chatApp",
    synchronize: true,
    logging: true,
    entities: [],
  });

  const app = express();

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(cookieParser());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = 4001;
  app.listen(port, () => {
    console.log(`graphql server : http://localhost:${port}/graphql`);
  });
};

main();
