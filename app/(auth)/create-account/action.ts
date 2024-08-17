"use server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

// const usernameSchema = z.string().min(5).max(10);

function checkUsername(username: string) {
  return !username.includes("potato");
}

const checkPassword = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const checkUniqueUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      // 현재는 해당 유저가 존재하는지만 알고싶은데 그냥 user를 찾아버리면 불필요한 정보까지 함께옴.
      // 지금은 용량이 작지만 결국에는 불필요한 정보는 가져오지 않는것이 좋음. 따라서 id만 가져오자.
      id: true,
    },
  });

  return !Boolean(user);
};

const checkUniqueEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return !Boolean(user);
};

// 현재는 만약 유저네임과 이메일 그리고 패스워드에서 유효성 검사를 틀렸다면 전부 다 검사해서 결과를 알려줌
// 하지만 그렇게 되면 데이터베이스를 2번 검사하는 꼴이됨. 이런 것도 고려. 따라서 superRefine로 1번만 호출하게 함
// 즉 만약에 유저네임에서 오류가 발생하면 그 아래것들은 검사하고싶지 않은거임.

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string",
        required_error: "Where is my username?",
      })
      //   .min(3, "too short")
      //   .max(10, "too long")
      .toLowerCase()
      .trim()
      //   .transform((username) => `🤡`)
      .refine(checkUsername, "No potatoes allowed"),
    //   .refine(checkUniqueUsername, "This username is already taken"),
    email: z.string().email().toLowerCase(),
    //   .refine(checkUniqueEmail, "This email is already taken"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(4),
  })
  .superRefine(async (data, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username: data.username,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이 유저네임은 중복임.",
        path: ["username"],
        fatal: true,
      });

      // 이렇게 fatal 이슈를 만들고 NEVER 를 리턴하면 다른 refine이 있어도 그것들은 실행되지 않음.
      return z.NEVER;
    }
  })
  .superRefine(async (data, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이 이메일은 중복임.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .refine(checkPassword, {
    message: "Both password should be the same",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  //   usernameSchema.parse(data.username);

  // 그냥 parse는 실패하면 에러를 발생시키기 때문에 try catch로 감싸야함.
  // formSchema.parse(data);
  const result = await formSchema.safeParseAsync(data);
  if (!result.success) {
    console.log("Super~ : ", result.error.flatten());

    return result.error.flatten();
  } else {
    // check if username is taken
    // check if the email is already used
    // hash password
    // save the user to db
    // log the user in
    // redirect "/home"

    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    const session = await getSession();

    session.id = user.id;
    await session.save();

    redirect("/profile");
  }
}
