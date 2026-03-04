import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "Docker-Web-Hugger",
    description: "A premium Docker web interface inspired by Hugging Face Spaces",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-white">
                <div className="flex flex-col md:flex-row min-h-screen">
                    <Sidebar />
                    <main className="flex-1 min-h-screen p-4 md:p-8 bg-white overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
