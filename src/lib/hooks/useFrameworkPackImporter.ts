'use client';

import { useState, useCallback } from 'react';

export interface ImportResult {
  framework_id: string;
  requirements_count: number;
  ucf_mappings_count: number;
  warnings: string[];
}

export function useFrameworkPackImporter() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importPack = useCallback(async (packData: any) => {
    setImporting(true);
    setProgress('Validating pack...');
    setErrors([]);
    setResult(null);

    try {
      setProgress('Importing framework and requirements...');
      const response = await fetch('/api/framework-packs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Import failed');
      }

      setProgress('Import complete!');
      setResult(json.data);
      return { data: json.data };
    } catch (err: any) {
      setErrors([err.message]);
      return { error: err.message };
    } finally {
      setImporting(false);
    }
  }, []);

  const parseJSONFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      return { data: JSON.parse(text) };
    } catch (err: any) {
      return { error: 'Invalid JSON file: ' + err.message };
    }
  }, []);

  return { importPack, parseJSONFile, importing, progress, errors, result };
}
