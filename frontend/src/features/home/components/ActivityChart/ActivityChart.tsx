import { useMemo } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { buildActivity, linePath } from "../../utils/home.utils";
import type { DashboardTask } from "../../api/home.api";

export function ActivityChart({ tasks }: { tasks: DashboardTask[] }) {
  const data = useMemo(() => buildActivity(tasks), [tasks]);
  const activityMax = Math.max(
    10,
    ...data.map((d) => Math.max(d.created, d.completed)),
  );

  const yTicks = useMemo(() => {
    const step = activityMax <= 10 ? 5 : Math.ceil(activityMax / 4 / 5) * 5;
    const ticks: number[] = [];
    for (let v = 0; v <= activityMax + step; v += step) {
      ticks.push(v);
      if (ticks.length >= 5) break;
    }
    return ticks;
  }, [activityMax]);

  const geometry = useMemo(() => {
    const W = 600;
    const H = 220;
    const padL = 34;
    const padR = 10;
    const padT = 14;
    const padB = 28;
    const top = Math.max(...yTicks, 1);
    const x = (i: number) =>
      padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1);
    const y = (v: number) => padT + (1 - v / top) * (H - padT - padB);
    return {
      W,
      H,
      padL,
      padB,
      createdPts: data.map((d, i) => ({ x: x(i), y: y(d.created) })),
      completedPts: data.map((d, i) => ({ x: x(i), y: y(d.completed) })),
      y,
    };
  }, [data, yTicks]);

  const completedTotal = data.reduce((sum, d) => sum + d.completed, 0);
  const last = geometry.completedPts[geometry.completedPts.length - 1];
  const first = geometry.completedPts[0];

  return (
    <section className="panel activity-chart">
      <div className="section-heading">
        <div>
          <h2>Task activity</h2>
          <p className="panel-subtitle">A little progress, every day.</p>
        </div>
        <div className="chart-legend">
          <span>
            <i className="indigo" /> Completed
          </span>
          <span>
            <i className="light-indigo" /> Created
          </span>
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<ChevronDown size={12} />}
            onPress={() => toast.info("Showing the last 7 days")}
          >
            Last 7 days
          </Button>
        </div>
      </div>
      <div className="chart-container">
        <svg
          viewBox={`0 0 ${geometry.W} ${geometry.H}`}
          role="img"
          aria-label="Tasks created vs completed over the last 7 days"
        >
          <defs>
            <linearGradient id="homeChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.17} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={geometry.padL}
                x2={geometry.W - 10}
                y1={geometry.y(tick)}
                y2={geometry.y(tick)}
                stroke="var(--border-subtle)"
                strokeDasharray="3 5"
              />
              <text
                x={geometry.padL - 8}
                y={geometry.y(tick) + 3}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
              >
                {tick}
              </text>
            </g>
          ))}
          {data.map((d, i) => (
            <text
              key={d.key}
              x={geometry.createdPts[i]?.x ?? geometry.padL}
              y={geometry.H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#94a3b8"
            >
              {d.day}
            </text>
          ))}
          <path
            d={linePath(geometry.createdPts)}
            fill="none"
            stroke="#b6bbfa"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          {first && last && (
            <path
              d={`${linePath(geometry.completedPts)}L${last.x.toFixed(1)},${(geometry.H - geometry.padB).toFixed(1)}L${first.x.toFixed(1)},${(geometry.H - geometry.padB).toFixed(1)}Z`}
              fill="url(#homeChartFill)"
              stroke="none"
            />
          )}
          <path
            d={linePath(geometry.completedPts)}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="chart-footer">
        <span>
          <span className="green-text">
            <ArrowUpRight size={14} />
            {completedTotal}
          </span>{" "}
          tasks completed in the last 7 days
        </span>
        <span>Keep the momentum going.</span>
      </div>
    </section>
  );
}

export default ActivityChart;
