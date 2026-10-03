import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDate,
  formatHit,
  formatMae,
  formatMove,
  formatMultiple,
  formatPrice,
} from "@/lib/format";
import { loadResults } from "@/lib/results";

export default function HomePage() {
  const results = loadResults();
  if (!results) {
    return (
      <section className="mx-auto max-w-xl py-16">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight">
          Scorecard not generated
        </h1>
        <p className="mt-4 text-muted-foreground">
          Meridian reads <code className="text-foreground">data/results.json</code>.
          From the <code className="text-foreground">pipeline</code> directory, install
          dependencies and score the checked-in prices:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-card p-4 text-sm">
          {`uv sync\nuv run python -m meridian run`}
        </pre>
      </section>
    );
  }

  const asOf = results.scorecard[0]?.asOf;

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <p className="text-sm text-muted-foreground">
          As of {asOf ? formatDate(asOf) : "the latest close"} · {results.horizonDays}-day horizon
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl tracking-tight sm:text-5xl">
          Five-day forecasts, scored out of sample
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Ridge regression forecasts the next five trading days for ten liquid US
          stocks. Each forecast is judged against a flat prediction and a momentum
          rule, on dates the model never trained on. A long-or-cash rule shows
          whether getting the sign right was worth more than simply holding.
        </p>
      </section>
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Close</TableHead>
              <TableHead>5-day forecast</TableHead>
              <TableHead>Ridge hit rate</TableHead>
              <TableHead>Ridge MAE</TableHead>
              <TableHead>Momentum hit rate</TableHead>
              <TableHead>Long or cash</TableHead>
              <TableHead>Buy and hold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.scorecard.map((row) => (
              <TableRow key={row.symbol}>
                <TableCell>
                  <Link href={`/ticker/${row.symbol}`} className="font-medium hover:underline">
                    {row.symbol}
                  </Link>
                  <div className="text-xs text-muted-foreground">{row.name}</div>
                </TableCell>
                <TableCell>{formatPrice(row.lastClose)}</TableCell>
                <TableCell>
                  <Badge variant={row.direction === "down" ? "destructive" : "secondary"}>
                    {row.direction === "down" ? "Down" : row.direction === "up" ? "Up" : "Flat"}{" "}
                    {formatMove(row.forecastReturn)}
                  </Badge>
                </TableCell>
                <TableCell>{formatHit(row.metrics.ridge.directionalAccuracy)}</TableCell>
                <TableCell>{formatMae(row.metrics.ridge.mae)}</TableCell>
                <TableCell>{formatHit(row.metrics.momentum.directionalAccuracy)}</TableCell>
                <TableCell>{formatMultiple(row.strategyMultiple)}</TableCell>
                <TableCell>{formatMultiple(row.buyHoldMultiple)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        Hit rate is the share of out-of-sample forecasts that got the sign right.
        Long-or-cash is invested only when the ridge forecast is positive, and it
        pays {results.costBps} bps each time that position changes. Buy-and-hold
        uses the same dates with no trading cost. A higher hit rate can still trail
        buy-and-hold.
      </p>
    </div>
  );
}
