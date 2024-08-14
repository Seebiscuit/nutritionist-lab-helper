"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UploadLabButton from "../UploadLabButton";

const queryClient = new QueryClient();

export default function Header() {
    const pathname = usePathname();

    return (
        <QueryClientProvider client={queryClient}>
            <header className="header-height bg-purple-600 text-white p-1">
                <nav className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Nutritionist Lab Helper</h1>
                    <ul className="flex flex-row items-center space-x-4">
                        <li>
                            <UploadLabButton />
                        </li>
                        <li>
                            <Link href="/" className={`hover:underline ${pathname === "/labs" ? "underline" : ""}`}>
                                Labs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/snippets"
                                className={`hover:underline ${pathname === "/snippets" ? "underline" : ""}`}
                            >
                                Snippets Dictionary
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
        </QueryClientProvider>
    );
}
