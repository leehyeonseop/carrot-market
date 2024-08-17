import db from "@/lib/db";
import getSession from "@/lib/session";
import { EyeIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlinedHandThumbUpIcon } from "@heroicons/react/24/outline";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatToTimeAgo } from "@/lib/utils";
import {
  revalidatePath,
  unstable_cache as nextCache,
  revalidateTag,
} from "next/cache";
import LikeButton from "@/components/like-button";
import Comments from "@/components/comments";
import { Prisma } from "@prisma/client";

async function getPost(id: number) {
  try {
    const post = await db.post.findUnique({
      where: {
        id,
      },
      //   data: {
      //     views: {
      //       increment: 1,
      //     },
      //   },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            // likes: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    return null;
  }
}

const getCachedPost = nextCache(getPost, ["post-detail"], {
  tags: ["post-detail"],
  revalidate: 60,
});

async function getPostViews(id: number) {
  const post = await db.post.update({
    where: {
      id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
    select: {
      views: true,
    },
  });

  if (!post) return null;

  return post.views;
}

async function getLikeStatus(postId: number, userId: number) {
  const isLiked = await db.like.findUnique({
    where: {
      id: {
        postId,
        userId,
      },
    },
  });

  const likeCount = await db.like.count({
    where: {
      postId,
    },
  });

  return {
    likeCount,
    isLiked: Boolean(isLiked),
  };
}

const getCachedLikeStatus = async (postId: number) => {
  const session = await getSession();
  const userId = session.id!;

  const cachedOperation = nextCache(getLikeStatus, ["product-like-status"], {
    tags: [`like-status-${postId}`],
  });

  return cachedOperation(postId, userId);
};

async function getComments(postId: number) {
  const comments = await db.comment.findMany({
    where: {
      postId,
    },
    select: {
      id: true,
      payload: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return comments;
}

export type CommentsType = Prisma.PromiseReturnType<typeof getComments>;

const getCachedComments = async (postId: number) => {
  const cachedOperation = nextCache(getComments, ["comments"], {
    tags: [`comments-${postId}`],
  });

  return cachedOperation(postId);
};

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return notFound();
  }

  const post = await getCachedPost(id);

  if (!post) return notFound();

  const { likeCount, isLiked } = await getCachedLikeStatus(id);

  const views = await getPostViews(id);

  const comments = await getCachedComments(id);

  const postComment = async (formData: FormData) => {
    "use server";

    const payload = formData.get("comment");

    console.log(payload);
  };

  return (
    <div className="p-5 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Image
          width={28}
          height={28}
          className="size-7 rounded-full"
          src={post.user.avatar!}
          alt={post.user.username}
        />
        <div>
          <span className="text-sm font-semibold">{post.user.username}</span>
          <div className="text-xs">
            <span>{formatToTimeAgo(post.created_at.toString())}</span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mb-5">{post.description}</p>
      <div className="flex flex-col gap-5 items-start">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <EyeIcon className="size-5" />
          <span>조회 {views}</span>
        </div>
        <LikeButton isLiked={isLiked} likeCount={likeCount} postId={id} />

        <Comments comments={comments} postId={id} />
      </div>
    </div>
  );
}
