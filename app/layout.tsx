import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen flex flex-col">
<Header />
                    <main className="flex-grow container mx-auto p-4">{children}</main>
                    <footer className="bg-gray-200 p-4 text-center">
                        <p>&copy; 2024 Nutritionist Lab Helper. All rights reserved.</p>
                    </footer>
                </div>
            </body>
        </html>
    );
}
