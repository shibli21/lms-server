import jwt from "jsonwebtoken";

const jwtSecret = "shibli";

export const getUserId = async (token: any) => {
  const response = jwt.verify(token, jwtSecret);
  const idS = JSON.stringify(response);
  const idP = JSON.parse(idS);

  return idP.userId;
};
