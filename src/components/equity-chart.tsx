"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; model: number; buyHold: number };

export function EquityChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(244,236,220,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            minTickGap={48}
            tick={{ fill: "#b5aa9a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={48}
            tick={{ fill: "#b5aa9a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${Number(value).toFixed(1)}×`}
          />
          <Tooltip
            contentStyle={{
              background: "#2a261f",
              border: "1px solid rgba(244,236,220,0.12)",
              borderRadius: 8,
              color: "#f4ecdc",
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(2)}×`,
              name === "buyHold" ? "Buy and hold" : "Long or cash",
            ]}
          />
          <Legend
            formatter={(value) => (value === "buyHold" ? "Buy and hold" : "Long or cash")}
          />
          <Line
            type="monotone"
            dataKey="model"
            stroke="#e4b15a"
            dot={false}
            strokeWidth={1.8}
          />
          <Line
            type="monotone"
            dataKey="buyHold"
            stroke="#8ea18a"
            dot={false}
            strokeWidth={1.8}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
