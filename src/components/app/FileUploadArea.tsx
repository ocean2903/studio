"use client";

import type { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface FileUploadAreaProps {
  onFileLoad: (fileName: string, data: Record<string, any>[]) => void;
  onError: (message: string) => void;
}

export function FileUploadArea({ onFileLoad, onError }: FileUploadAreaProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        const reader = new FileReader();
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
      } else {
        onError("Invalid file type. Please upload a JSON file (.json).");
      }
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <div className="w-full">
      <Label htmlFor="file-upload" className="sr-only">Upload JSON file</Label>
      <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors">
        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">JSON files only (array of objects)</p>
        <Input
            id="file-upload"
            type="file"
            accept=".json"
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
