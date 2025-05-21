"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataPreviewTableProps {
  data: Record<string, any>[];
  headers: string[];
}

export function DataPreviewTable({ data, headers }: DataPreviewTableProps) {
  if (!data || data.length === 0 || !headers || headers.length === 0) {
    return <p className="text-muted-foreground">No data to display.</p>;
  }

  return (
    <ScrollArea className="w-full h-[300px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 100).map((row, rowIndex) => ( // Preview limited to 100 rows for performance
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap">
                  {String(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
