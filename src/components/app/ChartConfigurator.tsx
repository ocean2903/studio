"use client";

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart2, LineChart, PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ChartConfig {
  chartType: "bar" | "line" | "pie";
  xAxis: string;
  yAxes: string[];
}

interface ChartConfiguratorProps {
  headers: string[];
  onSubmit: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
}

const chartTypes = [
  { value: "bar" as const, label: "Bar Chart", icon: BarChart2 },
  { value: "line" as const, label: "Line Chart", icon: LineChart },
  { value: "pie" as const, label: "Pie Chart", icon: PieChartIcon },
];

export function ChartConfigurator({ headers, onSubmit, initialConfig }: ChartConfiguratorProps) {
  const [chartType, setChartType] = useState<ChartConfig["chartType"]>(initialConfig?.chartType || "bar");
  const [xAxis, setXAxis] = useState<string>(initialConfig?.xAxis || (headers.length > 0 ? headers[0] : ""));
  const [yAxes, setYAxes] = useState<string[]>(initialConfig?.yAxes || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (headers.length > 0 && !xAxis) {
      setXAxis(headers[0]);
    }
  }, [headers, xAxis]);
  
  useEffect(() => {
    if (initialConfig) {
      setChartType(initialConfig.chartType);
      setXAxis(initialConfig.xAxis);
      setYAxes(initialConfig.yAxes);
    }
  }, [initialConfig]);


  const handleYAxisChange = (header: string) => {
    setYAxes((prev) => {
      if (chartType === "pie") {
        return prev.includes(header) ? [] : [header]; // For pie, only one Y-axis (value)
      }
      return prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header];
    });
  };

  const handleSubmit = () => {
    setError(null);
    if (!xAxis) {
      setError("Please select an X-axis column.");
      return;
    }
    if (yAxes.length === 0) {
      setError(`Please select at least one ${chartType === 'pie' ? 'Value' : 'Y-axis'} column.`);
      return;
    }
    if (chartType === "pie" && yAxes.length > 1) {
        setError("Pie charts can only have one Value column.");
        return;
    }
    onSubmit({ chartType, xAxis, yAxes });
  };
  
  const yAxisLabel = chartType === 'pie' ? 'Value Column (Select one)' : 'Y-Axis Columns (Select one or more)';


  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label className="text-base font-semibold mb-2 block">Chart Type</Label>
        <RadioGroup
          value={chartType}
          onValueChange={(value: ChartConfig["chartType"]) => {
            setChartType(value);
            setYAxes([]); // Reset Y-axes when chart type changes
          }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {chartTypes.map((type) => (
            <Label
              key={type.value}
              htmlFor={`chart-type-${type.value}`}
              className="flex-1 flex items-center space-x-2 p-4 border rounded-md cursor-pointer hover:border-primary transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
              data-state={chartType === type.value ? 'checked' : 'unchecked'}
            >
              <RadioGroupItem value={type.value} id={`chart-type-${type.value}`} className="sr-only" />
              <type.icon className="h-5 w-5 text-primary" />
              <span>{type.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="x-axis-select" className="text-base font-semibold mb-2 block">
            X-Axis (Category/Label)
          </Label>
          <Select value={xAxis} onValueChange={setXAxis} disabled={headers.length === 0}>
            <SelectTrigger id="x-axis-select" className="w-full">
              <SelectValue placeholder="Select X-axis column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">{yAxisLabel}</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-1 rounded-md border">
            {headers.filter(h => h !== xAxis).map((header) => ( // Exclude X-axis from Y-axis options
              <div key={header} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                <Checkbox
                  id={`y-axis-${header}`}
                  checked={yAxes.includes(header)}
                  onCheckedChange={() => handleYAxisChange(header)}
                  disabled={headers.length === 0 || (chartType === 'pie' && yAxes.length > 0 && !yAxes.includes(header))}
                />
                <Label htmlFor={`y-axis-${header}`} className="font-normal cursor-pointer flex-1">
                  {header}
                </Label>
              </div>
            ))}
            {headers.filter(h => h !== xAxis).length === 0 && <p className="p-2 text-sm text-muted-foreground">No available columns for Y-axis (or X-axis is the only column).</p>}
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full sm:w-auto" size="lg">
        Generate Chart
      </Button>
    </div>
  );
}
