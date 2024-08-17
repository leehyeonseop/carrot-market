"use client";
import { useFormStatus } from "react-dom";

interface ButtonProps {
  //   loading: boolean;
  text: string;
}

export default function Button({ text }: ButtonProps) {
  // form action의 작업상태를 알려주는 훅!
  // form이 pending인지도 알려주고 어떤 data가 전송되었는지도 알려줌.
  // 자동으로 부모 form을 찾을거임.
  // 이 훅은 form의 자식 요소에서 사용해야 함.
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="primary-btn h-10 disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed"
    >
      {pending ? "로딩 중" : text}
    </button>
  );
}
