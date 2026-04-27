import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hampton Roads Deal Finder",
  description: "Codex-first real estate wholesale deal dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-chrome">
          <aside className="rail" aria-label="Primary navigation">
            <Link className="brand" href="/">
              <span className="brand-mark">HR</span>
              <span>
                <strong>Deal Finder</strong>
                <small>Hampton Roads</small>
              </span>
            </Link>
            <nav>
              <Link href="/">Pipeline</Link>
              <Link href="/new">New Deal</Link>
              <Link href="/settings/markets">Markets</Link>
            </nav>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
