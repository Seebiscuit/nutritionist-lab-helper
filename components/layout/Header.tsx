"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="bg-blue-600 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Nutritionist Lab Helper</h1>
                <ul className="flex space-x-4">
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
    );
}
