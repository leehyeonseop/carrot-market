import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export default function getSession() {
  // iron-session은 Next.js가 우리에게 주는 쿠키를 가지고 delicious-carrot 이라는 쿠키가 있는지 찾을 거고 없으면 만듬.
  // 즉, 쿠키를 가져오거나 없으면 생성.
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-carrot",
    password: process.env.COOKIE_PASSWORD!,
  });
}
