// 이 함수가 서버에서만 실행되게해줌. 또한 최상단에 있어야함.
// 클라이언트 컴포넌트에서는 작동하지 않음. 따라서 use client와 같이 사용할 수 없음.
"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmailExists, "An account with this email does not exist"),
  password: z
    .string({
      required_error: "비밀번호는 필수 값 입니다.",
    })
    .min(PASSWORD_MIN_LENGTH)
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export const login = async (prevState: any, formData: FormData) => {
  // "use server";
  // 모든 input에 name을 꼭 정해줘야함.

  //   console.log("prev : ", prevState);
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  //   redirect("/");

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await formSchema.safeParseAsync(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    // find user with the email
    // if the user is found, check password hash
    // log the user in
    // redirect "/profile"

    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    console.log("로그인 유저 : ", user);

    // refine 에서 이미 user의 유무를 유효성검사했기때문에 이 코드가 실행될때는 user가 있는것이 확실함. 따라서 if else문이 아닌 !로 처리.
    const ok = await bcrypt.compare(result.data.password, user!.password ?? "");

    if (ok) {
      const session = await getSession();
      session.id = user!.id;

      await session.save();
      redirect("/profile");
    } else {
      return {
        fieldErrors: {
          password: ["비밀번호가 틀립니다."],
          email: [],
        },
      };
    }
  }
};
