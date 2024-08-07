import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4">
                <nav className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Nutritionist Lab Helper</h1>
                    <ul className="flex space-x-4">
                        <li>
                            <Link
                                href="/labs"
                                className={`hover:underline ${router.pathname === "/labs" ? "underline" : ""}`}
                            >
                                Labs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/snippets-dictionary"
                                className={`hover:underline ${
                                    router.pathname === "/snippets-dictionary" ? "underline" : ""
                                }`}
                            >
                                Snippets Dictionary
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className="flex-grow container mx-auto p-4">{children}</main>
            <footer className="bg-gray-200 p-4 text-center">
                <p>&copy; 2024 Nutritionist Lab Helper. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
