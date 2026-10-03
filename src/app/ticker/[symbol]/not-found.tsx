import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function TickerNotFound() {
  return (
    <section className="mx-auto max-w-xl py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight">
        That ticker is not on the bench
      </h1>
      <p className="mt-4 text-muted-foreground">
        Meridian covers SPY, QQQ, AAPL, MSFT, NVDA, AMZN, GOOGL, META, JPM, and XOM.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
        Back to the scorecard
      </Link>
    </section>
  );
}
