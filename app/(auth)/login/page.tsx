"use client";

import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import Button from "@/components/button";
import { login } from "./action";
import Input from "@/components/input";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export default function Login() {
  // 결과를 알고 싶은 action을 인자로 넘겨줘야함. 두번째는 초기값.
  // useFormState가 action을 호출하면 action은 formData와 함께 이전에 반환한 state, 또는 처음에 설정해둔 state와 실행됨.
  // 여러 단계를 거쳐야할때 유용함. 이전의 state를 받기때문.
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
        />
        <Button text="Log in" />
      </form>
      <SocialLogin />
    </div>
  );
}
