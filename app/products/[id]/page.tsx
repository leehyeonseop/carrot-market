import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
// fetch를 사용할 경우 자동으로 캐시되기 때문에 해줄 필요 없음.
// fetch 에도 next 에 revalidate나 tags를 똑같이 줄 수 있음.
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

async function getIsOwner(userId: number) {
  //   const session = await getSession();
  //   if (session.id) {
  //     return session.id === userId;
  //   }
  // Nextjs가 [id] 처럼 들어가는 페이지를 미리 render해주기를 바라기때문에 일단 쿠키 사용을 안할거임.

  return false;
}

async function getProduct(id: number) {
  //   await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("product");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });

  return product;
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail", "xxxx"],
});

async function getProductTitle(id: number) {
  //   await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("title");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });

  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  // 여러 태그를 가질 수 있으며 또한 공유될 수 있음.
  tags: ["product-title", "xxxx"],
});

// 아래 부분을 하나하나 붙여넣기 할 수도 없을 뿐더러 특정아이디나, 이름을 표시할 수 없음. => generateMetadata
// export const metadata = {
//   title: "Product",
// };

export async function generateMetadata({ params }: { params: { id: string } }) {
  // 햔제 여기에서도 데이터베이스에 접근을 하고 본문에서도 데이터 베이스 접근 함수를 또 사용함. 이건 실제로 두번 해야할까? => next cache
  const product = await getCachedProductTitle(Number(params.id));

  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  // id가 이상한 값일 수 있음 예를들어 우리는 숫자라고만 알고있는데 이상한 문자열이 올 수 있음 따라서 숫자로 변경 시도.
  // Number("adsfsf") => NaN
  const id = Number(params.id);

  if (isNaN(id)) {
    return notFound();
  }

  const product = await getCachedProduct(id);

  if (!product) {
    return notFound();
  }

  const isOwner = await getIsOwner(product.userId);

  const revalidate = async () => {
    "use server";
    revalidateTag("xxxx");
  };

  const createChatRoom = async () => {
    "use server";

    const session = await getSession();

    const room = await db.chatRoom.create({
      data: {
        users: {
          connect: [
            {
              id: product.userId,
            },
            {
              id: session.id,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    redirect(`/chats/${room.id}`);
  };

  return (
    <div>
      <div className="relative aspect-square">
        <Image
          fill
          className="object-cover"
          src={`${product.photo}/public`}
          alt={product.title}
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-lg">
          {formatToWon(product.price)}
        </span>
        {isOwner ? (
          <form action={revalidate}>
            <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
              Revalidate title cache
            </button>
          </form>
        ) : null}
        <form action={createChatRoom}>
          <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
            채팅하기
          </button>
        </form>
      </div>
    </div>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });

  // 이 페이지는 이런 종류의 parameter들을 받을 수 있어. 라고 배열로 알려주기.
  //   return [{ id: "4" }];
  return products.map((product) => ({ id: product.id + "" }));
}
