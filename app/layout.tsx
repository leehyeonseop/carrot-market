import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--roboto-text",
});
export const metadata: Metadata = {
  title: {
    template: "%s | Carrot Market",
    default: "Carrot Market",
  },
  description: "Sell and Buy all the things!",
};

export default function RootLayout({
  children,
  //   @ts-ignore
  potato,
}: Readonly<{
  children: React.ReactNode;
  potato: React.ReactNode;
}>) {
  //   console.log("potato : ", potato);

  return (
    <html lang="en">
      <body
        className={`${roboto.variable} bg-neutral-900 text-white max-w-screen-sm mx-auto`}
        // style={roboto.style}
      >
        {potato}
        {children}
      </body>
    </html>
  );
}
