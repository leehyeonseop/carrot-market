"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType, productSchema } from "./schema";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  // 이미지를 선택할때 one time upload url을 받아오자.
  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }

    const file = files[0];
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);

    const { success, result } = await getUploadUrl();

    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      //   setPhotoId(id);
      setValue(
        "photo",
        `https://imagedelivery.net/o_8dOf3T1x4s8X1UEJu1bA/${id}`
      );
    }
  };

  const onSubmit = handleSubmit(async (data: ProductType) => {
    // upload image to cloudFlare
    // replace `photo` in formData
    // call upload product

    // const file = formData.get("photo");
    if (!file) return;

    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudflareForm,
    });

    if (response.status !== 200) {
      return;
    }

    // const photoUrl = `https://imagedelivery.net/o_8dOf3T1x4s8X1UEJu1bA/${photoId}`;

    // formData.set("photo", photoUrl);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    formData.append("photo", data.photo);

    // 원래의 action에서 하던것들 (에러) 이런것들이 정상작동하게 하기 위해서 return 해주어야 함.
    // return uploadProduct(formData);
    const errors = await uploadProduct(formData);
    if (errors) {
      // setError("description")
    }
  });

  //   const [state, action] = useFormState(interceptAction, null);

  const onValid = async () => {
    await onSubmit();
  };

  return (
    <div>
      <form action={onValid} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-28" />
              <div className="text-neutral-400">
                사진을 추가해주세요.
                {errors.photo?.message}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          className="hidden"
        />
        <Input
          //   name="title"
          required
          placeholder="제목"
          type="text"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />
        <Input
          //   name="price"
          required
          placeholder="가격"
          type="number"
          {...register("price")}
          errors={[errors.price?.message ?? ""]}
        />
        <Input
          //   name="description"
          required
          placeholder="자세한 설명"
          type="text"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
