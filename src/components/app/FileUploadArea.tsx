"use client";

import type { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import * as XLSX from 'xlsx';

interface FileUploadAreaProps {
  onFileLoad: (fileName: string, data: Record<string, any>[]) => void;
  onError: (message: string) => void;
}

export function FileUploadArea({ onFileLoad, onError }: FileUploadAreaProps) {
  const parseCSV = (csvText: string): Record<string, any>[] => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      throw new Error("CSV file must have a header row and at least one data row.");
    }
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const rowObject: Record<string, any> = {};
        headers.forEach((header, index) => {
          rowObject[header] = values[index].trim();
        });
        data.push(rowObject);
      } else {
        console.warn(`Skipping row ${i+1} due to mismatched column count.`);
      }
    }
    return data;
  };
  
  const parseExcel = (arrayBuffer: ArrayBuffer): Record<string, any>[] => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Excel file does not contain any sheets.");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    if (!Array.isArray(jsonData) || jsonData.length === 0 || typeof jsonData[0] !== 'object' || jsonData[0] === null) {
        throw new Error("Invalid Excel format. Expected an array of objects after parsing.");
    }
    return jsonData;
  };


  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      try {
        if (file.type === "application/json") {
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const jsonData = JSON.parse(content);
              if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
                onFileLoad(file.name, jsonData);
              } else {
                onError("Invalid JSON format. Expected an array of objects.");
              }
            } catch (error) {
              onError(`Error parsing JSON: ${(error as Error).message}`);
            }
          };
          reader.onerror = () => {
              onError("Error reading file.");
          }
          reader.readAsText(file);
        } else if (file.type === "text/csv") {
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const parsedData = parseCSV(content);
               if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === 'object' && parsedData[0] !== null) {
                onFileLoad(file.name, parsedData);
              } else {
                onError("Invalid CSV format or empty file. Expected headers and data rows, resulting in an array of objects.");
              }
            } catch (error) {
              onError(`Error parsing CSV: ${(error as Error).message}`);
            }
          };
          reader.onerror = () => {
            onError("Error reading CSV file.");
          }
          reader.readAsText(file);
        } else if (file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            reader.onload = (e) => {
                try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const parsedData = parseExcel(arrayBuffer);
                     if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === 'object' && parsedData[0] !== null) {
                        onFileLoad(file.name, parsedData);
                    } else {
                        onError("Invalid Excel format or empty file. Expected sheets with data, resulting in an array of objects.");
                    }
                } catch (error) {
                    onError(`Error parsing Excel file: ${(error as Error).message}`);
                }
            };
            reader.onerror = () => {
                onError("Error reading Excel file.");
            }
            reader.readAsArrayBuffer(file);
        }
         else {
          onError("Invalid file type. Please upload a JSON, CSV, XLS, or XLSX file.");
        }
      } catch (error) {
         onError(`Failed to process file: ${(error as Error).message}`);
      }
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <div className="w-full">
      <Label htmlFor="file-upload" className="sr-only">Upload JSON, CSV or Excel file</Label>
      <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors">
        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">JSON, CSV, XLS, or XLSX files (array of objects for JSON)</p>
        <Input
            id="file-upload"
            type="file"
            accept=".json,.csv,.xls,.xlsx,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="sr-only"
        />
         <Button variant="outline" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
            Select File
        </Button>
      </div>
    </div>
  );
}
