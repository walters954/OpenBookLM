"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { CreateNotebookDialog } from "@/components/create-notebook-dialog";
import { GitHubStats } from "@/components/github-stats";
import Image from "next/image";
import { CreditStatus } from "@/components/credit-status";

interface RootLayoutProps {
    children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#1A1A1A]">
            <header className="sticky top-0 z-50 w-full border-b border-[#2A2A2A] bg-[#1A1A1A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1A1A]/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <Link
                            href="/"
                            className="mr-6 flex items-center space-x-2"
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                            />
                            <span className="hidden font-bold sm:inline-block text-gray-200">
                                OpenBookLM
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            <CreateNotebookDialog />
                        </div>
                        <nav className="flex items-center space-x-4">
                            <CreditStatus />
                            <Link
                                href="https://github.com/open-biz/OpenBookLM"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-gray-400 hover:text-gray-300"
                            >
                                <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0">
                                    <Github className="h-5 w-5" />
                                </div>
                                <GitHubStats />
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <div className="container">{children}</div>
            </main>
        </div>
    );
}
