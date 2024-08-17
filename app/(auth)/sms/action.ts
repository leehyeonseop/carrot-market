"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import crypto from "crypto";
import getSession from "@/lib/session";
import twilio from "twilio";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });

  return Boolean(exists);
}

// 유저가 입력한 string을 number로 변환하려고 시도.
const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "이 토큰은 존재하지 않습니다.");

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });

  if (exists) {
    return getToken();
  } else {
    return token;
  }
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);

    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // delete previous token
      // 유저는 하나의 토큰만 가져야하므로 또 다른 토큰을 요청하면 이전 토큰은 삭제해야함.
      // create token
      // send the token using twilio

      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });

      const token = await getToken();

      // 토큰을 만든 후에 휴대폰번호로 유저가 있는지 찾는 것 대신 아래와 같이 실행할것임.
      // user를 해당 전화번호를 가지고있는 user가 항상 존재할거라 가정.
      // 하지만 이 전화번호를 가진 user가 존재하지 않는다면? connect => connectOrCreate

      await db.sMSToken.create({
        data: {
          token,
          user: {
            // connect : {
            //     phone : result.data
            // }

            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });

      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

      await client.messages.create({
        body: `Your Carrot Verification code is ${token}`,
        from: process.env.TWILIO_PHONE!,
        // to: result.data, 현재는 twilio 체험판이므로 내 번호 입력
        to: process.env.MY_PHONE!,
      });

      return {
        token: true,
      };
    }
  } else {
    const result = await tokenSchema.safeParseAsync(token);
    if (!result.success) {
      return {
        token: true,
        // return the errors
        error: result.error.flatten(),
      };
    } else {
      // get the userId of token
      // log the user in

      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        },
      });

      const session = await getSession();
      session.id = token!.userId;
      await session.save();
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });

      redirect("/profile");
    }
  }
}
