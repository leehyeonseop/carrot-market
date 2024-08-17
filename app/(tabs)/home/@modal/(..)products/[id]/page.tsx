"use client";
// 이거 전체를 use client로 하게되면 서버 작업같은것들을 하지 못함. 또는 로직을 다른 곳으로 옮겨야됨. 따라서 버튼만 따로 클라이언트 컴포넌트로 분리하자. 즉 버튼만 클라이언트 컴포넌트로 구성하고 이거 전체는 서버 컴포넌트로 하자.

import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function Modal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const onCloseClick = () => {
    router.back();
  };

  return (
    <div className="absolute w-full h-full bg-black bg-opacity-60 left-0 top-0 z-50 flex justify-center items-center">
      <button onClick={onCloseClick} className="absolute right-5 top-5">
        <XMarkIcon className="size-10" />
      </button>
      <div className="max-w-screen-sm h-1/2 w-full flex justify-center">
        <div className="aspect-square bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
          <PhotoIcon className="h-28" />
        </div>
      </div>
    </div>
  );
}
