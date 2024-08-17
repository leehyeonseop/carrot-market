import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
  "/github/start": true,
  "/github/complete": true,
};

// 모든 요청에 대해서 실행되어서 여러번 실행됨.
export async function middleware(request: NextRequest) {
  //   console.log(request.url);
  //   console.log(request.nextUrl.pathname);
  console.log("하이 미들웨어");
  //   console.log(request.cookies.getAll());

  //   const session = await getSession();
  //   console.log("session : ", session);

  //   const pathname = request.nextUrl.pathname;

  //   if (pathname === "/") {
  //     const response = NextResponse.next();
  //     response.cookies.set("middleware-cookie", "hello");
  //     return response;
  //   }

  //   if (pathname === "/profile") {
  //     return Response.redirect(new URL("/", request.url));
  //   }

  // Error: PrismaClient is not configured to run in Edge Runtime
  // middleware는 Edge 런타임에서 실행됨. => 일종의 제한된 버전의 node.js
  // await db.user.findMany({});

  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (exists) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
}

export const config = {
  //   matcher: ["/", "/profile", "/create-account", "/user/:path*"],
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// "/user/:path*" 이거는 /user/... 에 모두 해당
