import Head from "next/head";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with R3F
const ShoeGrid = dynamic(() => import("@/components/grid/ShoeGrid"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <>
      <Head>
        <title>STREETKICKS - 3D магазин кроссовок в Москве</title>
        <meta name="description" content="Кроссовки в интерактивной 3D-витрине STREETKICKS. Оплата через СБП или банковский перевод, доставка по Москве." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ShoeGrid />
    </>
  );
}
