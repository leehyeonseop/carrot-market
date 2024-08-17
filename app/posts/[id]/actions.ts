"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

export const likePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));

  try {
    const session = await getSession();

    await db.like.create({
      data: {
        postId,
        userId: session.id!,
      },
    });

    //   revalidatePath(`/post/${id}`);
    //   revalidateTag("like-status");
    revalidateTag(`like-status-${postId}`);
  } catch (error) {}
};

export const dislikePost = async (postId: number) => {
  await new Promise((r) => setTimeout(r, 5000));

  try {
    const session = await getSession();

    await db.like.delete({
      where: {
        id: {
          postId,
          userId: session.id!,
        },
      },
    });

    // 이렇게 하게 되면 조회수도 같이 늘어남. 전체 path를 revalidate 하기 때문.
    //   revalidatePath(`/post/${id}`);
    //   또이렇게 하면 모든 id의 tag가 revalidate 됨
    //   revalidateTag("like-status");
    revalidateTag(`like-status-${postId}`);
  } catch (error) {}
};

export const postComment = async (postId: number, payload: string) => {
  await new Promise((r) => setTimeout(r, 3000));
  try {
    const session = await getSession();

    await db.comment.create({
      data: {
        payload,
        postId,
        userId: session.id!,
      },
    });

    revalidateTag(`comments-${postId}`);
  } catch (error) {}
};
