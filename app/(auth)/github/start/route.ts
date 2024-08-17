// react.js나 HTML을 리턴할것이 아님.

import { redirect } from "next/navigation";

export async function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user, user:email",
  };

  const formattedParams = new URLSearchParams(params).toString();
  //   console.log("formatted : ", formattedParams.toString());
  const finalUrl = `${baseURL}?${formattedParams}`;
  //   return Response.redirect(finalUrl);

  console.log(finalUrl);
  return redirect(finalUrl);
}
