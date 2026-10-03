import { SeriesChart } from "@/components/series-chart";

type Point = { date: string; close: number };

export function PriceChart({ data }: { data: Point[] }) {
  return (
    <SeriesChart
      data={data}
      xKey="date"
      height={256}
      label="Adjusted close"
      formatY={(value) => `$${Math.round(value)}`}
      series={[{ key: "close", color: "#e4b15a", label: "Close" }]}
    />
  );
}
