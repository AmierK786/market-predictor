import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-[family-name:var(--font-heading)] text-xl tracking-tight">
          Meridian
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Scorecard
          </Link>
          <Link href="/method" className="hover:text-foreground">
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}
