import type { Metadata } from "next";
import "./globals.css";

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
            <body>
                <main className="min-h-screen p-4 md:p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
