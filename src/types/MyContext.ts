import { Request, Response } from "express";

interface R extends Request {
  userId?: number;
}

export type MyContext = {
  req: R;
  res: Response;
};
