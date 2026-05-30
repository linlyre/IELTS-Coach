"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function useChartSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ height: 288, width: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    function updateSize() {
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        setSize({
          height: Math.round(rect.height),
          width: Math.round(rect.width),
        });
      }
    }

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

export function BandTrendChart({
  data,
}: {
  data: { date: string; band: number }[];
}) {
  const mounted = useMounted();
  const { ref, size } = useChartSize();
  const canRenderChart = mounted && data.length > 0 && size.width > 0;

  return (
    <div className="h-72 min-h-72 min-w-[240px] w-full" ref={ref}>
      {canRenderChart ? (
        <AreaChart
          data={data}
          height={size.height}
          margin={{ left: -20, right: 10, top: 10 }}
          width={size.width}
        >
          <XAxis dataKey="date" tickLine={false} />
          <YAxis domain={[1, 9]} tickLine={false} />
          <Tooltip />
          <Area
            dataKey="band"
            fill="#E8F1E7"
            stroke="#2F6B45"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      ) : (
        <div className="flex h-full items-center justify-center rounded-2xl bg-[#FAFBF7] text-sm text-[#8A938B]">
          暂无趋势数据
        </div>
      )}
    </div>
  );
}

export function CriteriaRadarChart({
  data,
}: {
  data: { name: string; score: number; target: number }[];
}) {
  const mounted = useMounted();
  const { ref, size } = useChartSize();
  const canRenderChart = mounted && size.width > 0;

  return (
    <div className="h-72 min-h-72 min-w-[240px] w-full" ref={ref}>
      {canRenderChart ? (
        <RadarChart data={data} height={size.height} width={size.width}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "#5F6B61", fontSize: 12 }}
          />
          <Radar
            dataKey="target"
            fill="transparent"
            stroke="#8A938B"
            strokeDasharray="5 5"
          />
          <Radar
            dataKey="score"
            fill="#E8F1E7"
            fillOpacity={0.7}
            stroke="#2F6B45"
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      ) : (
        <div className="h-full rounded-2xl bg-[#FAFBF7]" />
      )}
    </div>
  );
}
