type Series = {
  key: string;
  color: string;
  label: string;
};

type Point = Record<string, string | number>;

const WIDTH = 800;

export function SeriesChart({
  data,
  xKey,
  series,
  height = 256,
  formatY,
  label,
}: {
  data: Point[];
  xKey: string;
  series: Series[];
  height?: number;
  formatY: (value: number) => string;
  label: string;
}) {
  if (data.length === 0) return null;

  const pad = { top: 16, right: 16, bottom: 36, left: 64 };
  const innerWidth = WIDTH - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const values = series.flatMap((item) =>
    data.map((point) => Number(point[item.key])).filter((value) => Number.isFinite(value)),
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const xAt = (index: number) =>
    pad.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yAt = (value: number) => pad.top + (1 - (value - min) / span) * innerHeight;
  const ticks = [max, (max + min) / 2, min];
  const xLabels = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="h-64 w-full"
        role="img"
        aria-label={label}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={WIDTH - pad.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="rgba(244,236,220,0.12)"
            />
            <text x={pad.left - 8} y={yAt(tick) + 4} textAnchor="end" fill="#b5aa9a" fontSize="12">
              {formatY(tick)}
            </text>
          </g>
        ))}
        {series.map((item) => {
          const path = data
            .map((point, index) => {
              const value = Number(point[item.key]);
              if (!Number.isFinite(value)) return null;
              return `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`;
            })
            .filter(Boolean)
            .join(" ");
          return (
            <path
              key={item.key}
              d={path}
              fill="none"
              stroke={item.color}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {xLabels.map((index) => (
          <text
            key={index}
            x={xAt(index)}
            y={height - 10}
            textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
            fill="#b5aa9a"
            fontSize="12"
          >
            {String(data[index]?.[xKey] ?? "")}
          </text>
        ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2">
            <span className="inline-block h-0.5 w-4" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
