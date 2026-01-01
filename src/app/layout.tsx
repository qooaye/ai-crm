import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI CRM - Intelligent Relationship Management",
    description: "Manage your contacts and communications with AI power.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen`}>
                <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="text-xl font-bold premium-gradient bg-clip-text text-transparent">
                        AI CRM
                    </div>
                    <div className="flex gap-6">
                        <a href="/contacts" className="hover:text-primary transition-colors">Contacts</a>
                        <a href="/emails" className="hover:text-primary transition-colors">Emails</a>
                        <a href="/marketing" className="hover:text-primary transition-colors">Marketing</a>
                        <a href="/import" className="hover:text-primary transition-colors">Import</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full premium-gradient"></div>
                    </div>
                </nav>
                <main className="pt-24 px-6 pb-12 overflow-x-hidden">
                    {children}
                </main>
            </body>
        </html>
    );
}
