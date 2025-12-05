'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportContactsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Preview CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        setError('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });

      setPreview(previewData);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/import-export/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
      
      // Redirect to contacts page after successful import
      if (response.data.data.success > 0) {
        setTimeout(() => {
          router.push('/portal/contacts');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to import contacts. Please check your CSV file format.');
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    } else {
      setError('Please drop a CSV file');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/portal/contacts"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Import Contacts</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import contacts
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {!result ? (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-2">CSV File Requirements</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Required columns: <code className="bg-secondary px-1 rounded">first_name</code>, <code className="bg-secondary px-1 rounded">last_name</code></li>
                <li>Optional columns: <code className="bg-secondary px-1 rounded">email</code>, <code className="bg-secondary px-1 rounded">phone</code>, <code className="bg-secondary px-1 rounded">mobile</code>, <code className="bg-secondary px-1 rounded">job_title</code>, <code className="bg-secondary px-1 rounded">department</code>, <code className="bg-secondary px-1 rounded">lifecycle_stage</code>, <code className="bg-secondary px-1 rounded">notes</code></li>
                <li>File size limit: 10MB</li>
              </ul>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                      Select File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="mx-auto h-12 w-12 text-primary" />
                  <div>
                    <p className="text-lg font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreview([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="mt-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {preview.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        {Object.keys(preview[0] || {}).map((header) => (
                          <th key={header} className="px-4 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleImport}
                  disabled={importing || !file}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : 'Import Contacts'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Import Complete</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{result.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-sm text-muted-foreground">Success</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="font-medium mb-2">Errors:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>... and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Redirecting to contacts page...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

