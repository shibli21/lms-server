import { UserInputType } from "./UserInput";

export const validateRegister = (options: UserInputType) => {
  if (options.name.includes("@")) {
    return [
      {
        field: "name",
        message: "Can't includes an @ ",
      },
    ];
  }
  if (options.name.length <= 2) {
    return [
      {
        field: "name",
        message: "name can't be less than 2 word",
      },
    ];
  }
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }
  if (options.password.length < 6) {
    return [
      {
        field: "password",
        message: "password can't be less than 6 word",
      },
    ];
  }

  return null;
};
