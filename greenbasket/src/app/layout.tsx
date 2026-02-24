import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import Inituser from "@/Inituser";



export const metadata: Metadata = {
  title: "GreenBasket | world's best fresh basket at your home ",
  description: "world's best fresh basket at your home ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen  bg-linear-to-b from-green-200 to-white">
        <Provider>
          <StoreProvider>
            <Inituser/>
          {children}
       
          </StoreProvider>
          </Provider>
        
       
      </body>
    </html>
  );
}
