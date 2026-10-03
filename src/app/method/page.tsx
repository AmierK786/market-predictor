import type { Metadata } from "next";
import { loadResults } from "@/lib/results";

export const metadata: Metadata = {
  title: "Methodology · Meridian",
};

export default function MethodPage() {
  const results = loadResults();
  const horizon = results?.horizonDays ?? 5;
  const train = results?.trainDays ?? 504;
  const test = results?.testDays ?? 21;
  const gap = results?.gapDays ?? 5;
  const cost = results?.costBps ?? 5;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight sm:text-5xl">
          How the forecasts are scored
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Meridian is a forecast bench. It asks whether a simple model, trained only
          on the past, says anything useful about the next {horizon} trading days.
          The interesting result is usually how little it adds over a dumb rule.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">The target</h2>
        <p className="leading-7 text-muted-foreground">
          The label on date T is the log change in the adjusted close from T to T+{horizon}.
          Five days is long enough to be less noisy than a one-day move, and short
          enough to explain in one sentence. The latest forecast uses the last close
          in the snapshot. Its outcome is not known yet, so it is not in the score.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">The features</h2>
        <p className="leading-7 text-muted-foreground">
          Each row carries the 1-day, 5-day, and 21-day log returns, the 21-day
          volatility of daily returns, and a 21-day volume z-score. All of those
          numbers are computed from prices and volume through date T. The forward
          return is stored beside them and is never passed to the model as an input.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">The gap</h2>
        <p className="leading-7 text-muted-foreground">
          Evaluation walks forward. The model trains on about {train} trading days
          (two years), then predicts the next {test} trading days, then rolls.
          Training stops {gap} trading days before the test window. That matches the
          label length, so a training label cannot reach into the test period. A
          test in <code className="text-foreground">pipeline/tests</code> fails if
          that gap shrinks.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">The baselines</h2>
        <p className="leading-7 text-muted-foreground">
          Zero always predicts a flat return. It is the error baseline: a model that
          cannot beat it on mean absolute error is not forecasting magnitude.
          Momentum predicts that the trailing 21-day move continues, scaled to five
          days. Directional accuracy ignores the zero forecast, because a flat call
          has no sign. Rank correlation asks whether larger forecasts lined up with
          larger outcomes.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">The curve</h2>
        <p className="leading-7 text-muted-foreground">
          Long-or-cash holds the stock when the ridge forecast is positive and holds
          cash otherwise. Decisions are taken every {horizon} trading days so the
          returns do not overlap. Changing position costs {cost} basis points.
          Buy-and-hold compounds the same stretches with no cost. Beating a coin
          flip on sign and still trailing buy-and-hold are both allowed outcomes.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">What to say about it</h2>
        <p className="leading-7 text-muted-foreground">
          The project demonstrates a data pipeline, a purged walk-forward split, and
          a dashboard over a typed results file. It does not place orders, and a
          hit rate near one half is the expected neighborhood for daily equity
          returns. If someone asks whether it makes money, walk them through the
          curve against buy-and-hold rather than the hit rate alone.
        </p>
      </section>
    </article>
  );
}
