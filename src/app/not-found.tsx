import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight">
        That page is not on the bench
      </h1>
      <p className="mt-4 text-muted-foreground">
        The scorecard lists the ten stocks Meridian forecasts.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
        Back to the scorecard
      </Link>
    </section>
  );
}
