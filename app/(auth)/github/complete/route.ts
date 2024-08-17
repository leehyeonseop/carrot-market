import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }

  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();

  const accessTokenUrl = `https://github.com/login/oauth/access_token?${accessTokenParams}`;

  const { error, access_token } = await (
    await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  // Next.js에서 GET요청을 보내면 기본적으로 그 GET request들은 Next.js의 cache에 의해서 저장됨.
  // 하지만 캐싱하고 싶지 않음.
  const userProfileResponse = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });

  const { id, avatar_url, login } = await userProfileResponse.json();
  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });

  console.log("일단 user : ", user);

  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }

  // 유저네임 중복 가능성 있음. 코드 챌린지.
  const newUser = await db.user.create({
    data: {
      username: login,
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });

  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}
