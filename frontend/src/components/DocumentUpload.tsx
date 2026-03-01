"use client";

import { useState, useCallback, useRef } from "react";

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface DocumentUploadProps {
  onUpload: (file: UploadedFile) => void;
  files: UploadedFile[];
  onRemove: (url: string) => void;
}

export default function DocumentUpload({ onUpload, files, onRemove }: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Upload failed");
          return;
        }
        onUpload(data as UploadedFile);
      } catch {
        setError("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload],
  );

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-slate-300 bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        {uploading ? (
          <p className="text-xs text-slate-500 animate-pulse">Uploading...</p>
        ) : (
          <p className="text-xs text-slate-500">
            Drop file here or <span className="text-blue-600 underline">browse</span>
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li
              key={f.url}
              className="flex items-center gap-2 bg-white border border-slate-100 rounded px-2 py-1"
            >
              {f.type.startsWith("image/") ? (
                <img src={f.url} alt={f.name} className="w-8 h-8 object-cover rounded" />
              ) : (
                <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-[10px] font-bold text-red-500">
                  PDF
                </div>
              )}
              <span className="text-xs text-slate-700 truncate flex-1">{f.name}</span>
              <button
                onClick={() => onRemove(f.url)}
                className="text-slate-400 hover:text-red-500 text-xs"
                title="Remove"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
