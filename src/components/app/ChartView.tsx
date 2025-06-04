"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import type { ChartConfig } from "./ChartConfigurator"; // Assuming ChartConfig is exported

interface ChartViewProps {
  data: Record<string, any>[];
  config: ChartConfig;
}

// Predefined colors for chart elements, using CSS variables for theme compatibility
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ChartView({ data, config }: ChartViewProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No data available for charting.</p>;
  }

  const { chartType, xAxis, yAxes } = config;

  const chartData = data.map(item => {
    const yAxisData: Record<string, number | string> = {};
    yAxes.forEach(yAxisKey => {
      const val = parseFloat(item[yAxisKey]);
      yAxisData[yAxisKey] = isNaN(val) ? item[yAxisKey] : val; // Keep as string if not parsable, or handle error
    });
    return {
      [xAxis]: item[xAxis],
      ...yAxisData,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border border-border rounded-md shadow-lg">
          <p className="label font-semibold text-foreground">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent) / 0.2)" }}/>
          <Legend />
          {yAxes.map((yAxisKey, index) => (
            <Bar key={yAxisKey} dataKey={yAxisKey} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--accent) / 0.2)", strokeWidth: 1 }}/>
          <Legend />
          {yAxes.map((yAxisKey, index) => (
            <Line key={yAxisKey} type="monotone" dataKey={yAxisKey} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "pie") {
    const pieData = data
      .map(item => ({
        name: item[xAxis],
        value: parseFloat(item[yAxes[0]]), // use first y-axis value for pie slices
      }))
      .filter(item => !isNaN(item.value));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="hsl(var(--primary))"
            dataKey="value"
            stroke="hsl(var(--background))"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />}/>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <p className="text-center text-muted-foreground">Select a chart type to visualize data.</p>;
}

