"use client";

import ListProduct from "./list-products";
import { useEffect, useRef, useState } from "react";
import { InitialProducts } from "@/app/(tabs)/home/page";
import { getMoreProducts } from "@/app/(tabs)/home/actions";

interface ProductListProps {
  initialProducts: InitialProducts;
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);

  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [isLastPage, setIsLastPage] = useState(false);

  const trigger = useRef<HTMLSpanElement>(null);

  // 트리거가 보이면 상품을 더불러온다 하지만, 이미지는 보여질때 로드되는것을 네트워크 탭에서 확인함.
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        const element = entries[0];
        if (element.isIntersecting && trigger.current) {
          observer.unobserve(trigger.current);
          setIsLoading(true);
          const newProducts = await getMoreProducts(page + 1);
          if (newProducts.length !== 0) {
            setPage((prev) => prev + 1);
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            setIsLastPage(true);
          }

          setIsLoading(false);
        }
      },
      {
        threshold: 1.0,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (trigger.current) {
      observer.observe(trigger.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [page]);

  const onLoadMoreClick = async () => {
    setIsLoading(true);
    const newProducts = await getMoreProducts(page + 1);

    if (newProducts.length !== 0) {
      setPage((prev) => prev + 1);
      setProducts((prev) => [...prev, ...newProducts]);
    } else {
      setIsLastPage(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
      {/* {!isLastPage ? (
        <span
          ref={trigger}
          className="ext-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
        >
          {isLoading ? "로딩 중" : "Load more"}
        </span>
      ) : null} */}
    </div>
  );
}
