import ListProduct from "@/components/list-products";
import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { unstable_cache as nextCache, revalidatePath } from "next/cache";

// 데이터베이스의 query 같이 값비싼 게산의결과를 메모리에 저장할 수 있게 해줌.
const getCachedProducts = nextCache(getInitialProducts, ["home-products"], {
  //   revalidate: 60,
  // 이는 Next.js가 이 함수를 60초마다 호출할거란 뜻이 아님.
  // 이 함수가 호출한 후 60초가 지나지 않은 경우 Next.js는 cache 안에 있는 데이터를 return
  // 60초가 지난 후 새로운 요청이 있다면 그때 Next.js가 이 함수를 다시 호출할거라는 의미.
});

async function getInitialProducts() {
  //   await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("hit!!!");

  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    // take: 1,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export const metadata = {
  title: "Home",
};

// export const dynamic = "force-dynamic";

export const revalidate = 30;

export default async function Products() {
  //   const initialProducts = await getInitialProducts();
  const initialProducts = await getInitialProducts();

  const revalidate = async () => {
    "use server";
    // 1. URL 타겟팅해서 /home 페이지와 연결되어있는 모든 데이터를 새로고침해줘!
    // 해당 경로의 모든 cache를 모두 새로고침.
    revalidatePath("/home");
  };

  return (
    <div>
      <Link href={"/home/recent"}>Recent</Link>
      <ProductList initialProducts={initialProducts} />
      <form action={revalidate}>
        <button>Revalidate</button>
      </form>
      <Link
        href="/products/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
