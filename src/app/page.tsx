"use client";

import { useState, useEffect } from "react";
import { ChartasticLogo } from "@/components/icons/ChartasticLogo";
import { FileUploadArea } from "@/components/app/FileUploadArea";
import { DataPreviewTable } from "@/components/app/DataPreviewTable";
import { ChartConfigurator, type ChartConfig } from "@/components/app/ChartConfigurator";
import { ChartView } from "@/components/app/ChartView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function ChartasticPage() {
  const [fileData, setFileData] = useState<Record<string, any>[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    if (fileData && fileData.length > 0) {
      const firstRow = fileData[0];
      if (typeof firstRow === 'object' && firstRow !== null) {
        setHeaders(Object.keys(firstRow));
        // Reset chart when new data is loaded
        setChartConfig(null);
        setShowChart(false);
      } else {
        handleError("Uploaded data is not in the expected format (array of objects).");
        resetState();
      }
    }
  }, [fileData]);

  const handleFileLoad = (name: string, data: Record<string, any>[]) => {
    setFileData(data);
    setFileName(name);
    toast({
      title: "File Loaded Successfully",
      description: `${name} has been loaded and parsed.`,
    });
  };

  const handleError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleChartConfigSubmit = (config: ChartConfig) => {
    setChartConfig(config);
    setShowChart(true);
    toast({
      title: "Chart Generated",
      description: `Displaying ${config.chartType} chart.`,
    });
  };

  const resetState = () => {
    setFileData(null);
    setFileName(null);
    setHeaders([]);
    setChartConfig(null);
    setShowChart(false);
  }

  const handleReset = () => {
    resetState();
    toast({
      title: "Reset",
      description: "Application state has been reset.",
    });
  };


  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-background">
      <header className="w-full max-w-5xl mb-8">
        <div className="flex items-center space-x-3">
          <ChartasticLogo className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Chartastic
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Upload your data, configure your chart, and visualize insights instantly.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">1. Upload Your Data</CardTitle>
            <CardDescription>
              Upload a JSON, CSV, XLS, or XLSX file. JSON files should contain an array of objects. CSV/Excel files should have a header row.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadArea onFileLoad={handleFileLoad} onError={handleError} />
            {fileName && (
              <div className="mt-4 p-3 bg-secondary rounded-md text-sm">
                Loaded file: <span className="font-semibold text-primary">{fileName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {fileData && headers.length > 0 && (
          <>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">2. Preview Data</CardTitle>
                <CardDescription>
                  A quick look at the first few rows of your uploaded data. Limited to 100 rows for preview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataPreviewTable data={fileData} headers={headers} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">3. Configure Your Chart</CardTitle>
                <CardDescription>
                  Select the chart type, X-axis (categories/labels), and Y-axis (values).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartConfigurator 
                  headers={headers} 
                  onSubmit={handleChartConfigSubmit} 
                  initialConfig={chartConfig || undefined}
                />
              </CardContent>
            </Card>
          </>
        )}

        {showChart && fileData && chartConfig && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">4. Your Chart</CardTitle>
              <CardDescription>
                Generated <span className="font-semibold text-primary">{chartConfig.chartType} chart</span> based on your selections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartView data={fileData} config={chartConfig} />
            </CardContent>
          </Card>
        )}
         {(fileData || chartConfig || showChart) && (
          <div className="pt-4 text-center">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw size={16}/> Start Over / Reset
            </Button>
          </div>
        )}
      </main>
      <footer className="w-full max-w-5xl mt-12 py-6 text-center text-muted-foreground text-sm">
        <Separator className="mb-4" />
        <p>&copy; {new Date().getFullYear()} Chartastic. Built with Next.js and Shadcn/UI.</p>
      </footer>
    </div>
  );
}
