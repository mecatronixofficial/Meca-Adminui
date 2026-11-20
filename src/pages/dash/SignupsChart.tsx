import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Daily sign-ups as columns: one series, so no legend; the card title names it. */

export type DayCount = { day: string; label: string; count: number };

const ACCENT = "#e10600"; // validated: contrast ≥3:1 on white, inside the lightness band

/** Only reads what it renders, so it accepts Recharts' full tooltip props without narrowing their generics. */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) {
  const point = payload?.[0]?.payload as DayCount | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="text-muted">{point.label}</p>
      <p className="mt-0.5 font-medium text-ink tabular-nums">
        {point.count} sign-up{point.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default function SignupsChart({ data }: { data: DayCount[] }) {
  return (
    <>
      <div className="h-44 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} stroke="#ececef" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#dcdce1" }}
              tick={{ fill: "#6b7080", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7080", fontSize: 11 }} width={48} />
            <Tooltip content={ChartTooltip} cursor={{ fill: "rgb(11 13 18 / 0.04)" }} />
            <Bar dataKey="count" fill={ACCENT} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Table view for screen readers */}
      <table className="sr-only">
        <caption>Newsletter sign-ups per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Sign-ups</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.label}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
