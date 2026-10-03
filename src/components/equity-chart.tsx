import { SeriesChart } from "@/components/series-chart";

type Point = { date: string; model: number; buyHold: number };

export function EquityChart({ data }: { data: Point[] }) {
  return (
    <SeriesChart
      data={data}
      xKey="date"
      height={280}
      label="Long or cash against buy and hold"
      formatY={(value) => `${value.toFixed(1)}×`}
      series={[
        { key: "model", color: "#e4b15a", label: "Long or cash" },
        { key: "buyHold", color: "#8ea18a", label: "Buy and hold" },
      ]}
    />
  );
}
