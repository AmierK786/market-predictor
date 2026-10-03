import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EquityChart } from "@/components/equity-chart";
import { PriceChart } from "@/components/price-chart";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FEATURE_LABELS,
  formatDate,
  formatCorrelation,
  formatHit,
  formatMae,
  formatMove,
  formatMultiple,
  formatPrice,
  formatWeight,
} from "@/lib/format";
import { loadResults } from "@/lib/results";

type PageProps = {
  params: Promise<{ symbol: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} forecast · Meridian` };
}

export default async function TickerPage({ params }: PageProps) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  const results = loadResults();

  if (!results) {
    return (
      <section className="mx-auto max-w-xl py-16">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight">
          Forecasts are not generated yet
        </h1>
        <p className="mt-4 text-muted-foreground">
          Run the pipeline so Meridian can load <code className="text-foreground">data/results.json</code>.
        </p>
        <Link href="/" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
          Back to the scorecard
        </Link>
      </section>
    );
  }

  const ticker = results.tickers[upper];
  if (!ticker) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Scorecard
          </Link>
          <span> / {upper}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight sm:text-5xl">
              {ticker.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {upper} closed at {formatPrice(ticker.lastClose)} on {formatDate(ticker.asOf)}.
            </p>
          </div>
          <Badge variant={ticker.direction === "down" ? "destructive" : "secondary"} className="h-7 px-3 text-sm">
            Next {results.horizonDays} days {ticker.direction} {formatMove(ticker.forecastReturn)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Ridge hit rate</CardDescription>
            <CardTitle className="text-2xl">
              {formatHit(ticker.metrics.ridge.directionalAccuracy)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Momentum hit {formatHit(ticker.metrics.momentum.directionalAccuracy)}. The flat
            forecast has no direction, so it is scored on error only.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ridge MAE</CardDescription>
            <CardTitle className="text-2xl">{formatMae(ticker.metrics.ridge.mae)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Flat MAE {formatMae(ticker.metrics.zero.mae)} · Momentum MAE{" "}
            {formatMae(ticker.metrics.momentum.mae)} · {ticker.metrics.ridge.n} out-of-sample days
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Long or cash vs holding</CardDescription>
            <CardTitle className="text-2xl">{formatMultiple(ticker.strategyMultiple)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Buy and hold on the same non-overlapping dates finished{" "}
            {formatMultiple(ticker.buyHoldMultiple)}. The rule pays {results.costBps} bps when
            the position changes.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Adjusted close</CardTitle>
            <CardDescription>Daily prices from the checked-in snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceChart data={ticker.prices} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest ridge weights</CardTitle>
            <CardDescription>
              Fit on the last {results.trainDays} labeled days. Weights are on standardized features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {ticker.coefficients.map((item) => (
                <li key={item.feature} className="flex items-center justify-between gap-4 text-sm">
                  <span>{FEATURE_LABELS[item.feature] ?? item.feature}</span>
                  <span className="font-mono">{formatWeight(item.weight)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Long or cash against buy and hold</CardTitle>
          <CardDescription>
            Wealth starting at 1. Each point is a {results.horizonDays}-day stretch, so the
            returns do not overlap. Rank correlation of the ridge forecast was{" "}
            {formatCorrelation(ticker.metrics.ridge.rankCorrelation)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ticker.equity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough history to draw the curve.</p>
          ) : (
            <EquityChart data={ticker.equity} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
