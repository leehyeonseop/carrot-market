"use client";

import { postComment } from "@/app/posts/[id]/actions";
import { CommentsType } from "@/app/posts/[id]/page";
import { useOptimistic, useState } from "react";

interface Props {
  comments: CommentsType;
  postId: number;
}

export default function Comments({ comments, postId }: Props) {
  const [comment, setComment] = useState("");

  const [state, reducer] = useOptimistic(
    comments,
    (prevState, payload: any) => {
      const newComment = {
        id: Math.random(),
        user: {
          username: "현썹",
        },
        payload,
      };

      return [...prevState, newComment];
    }
  );

  const onClick = () => {
    reducer(comment);
    postComment(postId, comment);
  };

  return (
    <div className="border-red-600">
      {state.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <span>{comment.user.username}</span>
          <span>{comment.payload}</span>
        </div>
      ))}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        name="comment"
        className="bg-slate-500 text-white"
      />
      <button onClick={onClick}>제출</button>
    </div>
  );
}
