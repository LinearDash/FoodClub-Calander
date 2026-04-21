/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { getGlobalDocuments, saveDocumentRecord } from "../events/actions";
import { createClient } from "@/utils/supabase/client";

interface Doc {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
  eventName?: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const loadData = async () => {
    const data = await getGlobalDocuments();
    setDocs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFiles = async (files: File[], forcedName?: string) => {
    setLoading(true);
    const supabase = createClient();

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = forcedName || file.name;
      const filePath = `global/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        alert(
          `Upload Failed: ${uploadError.message}. Make sure you have a public bucket named "documents" in Supabase.`,
        );
        setLoading(false);
        return;
      }

      // Save to DB
      const result = await saveDocumentRecord(
        "",
        filePath,
        fileName,
        file.type,
        formatFileSize(file.size),
      );

      if (result?.error) {
        alert(
          `Database Save Failed: ${result.error}. The file was uploaded to storage, but the record wasn't created.`,
        );
        setLoading(false);
        return;
      }
    }

    alert("Upload successful!");
    loadData();
  };

  const getDocumentPublicUrl = (path: string) => {
    const supabase = createClient();
    const { data } = supabase.storage.from("documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const isImageDoc = (doc: Doc) => doc.type.toLowerCase().startsWith("image");
  const isPdfDoc = (doc: Doc) =>
    doc.type.toLowerCase().includes("pdf") ||
    doc.name.toLowerCase().endsWith(".pdf");

  return (
    <div
      className={`relative min-h-[80vh] space-y-6 md:space-y-8 pb-32 md:pb-12 transition-colors duration-200 rounded-3xl ${isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary pointer-events-none">
          <div className="text-2xl font-display font-bold text-primary flex flex-col items-center gap-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Drop files here to upload
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 pt-2">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
          Documents
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md shadow-primary/20 w-full md:w-auto active:scale-95"
        >
          + Add Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-on-surface-variant/30 font-black uppercase tracking-[0.2em]">
            Loading...
          </div>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm hover:shadow-md transition group flex flex-col justify-between h-[180px] md:h-auto"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-low text-on-surface-variant rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs ring-1 ring-inset ring-outline-variant/20 px-1 truncate text-center uppercase tracking-tighter">
                    {doc.type.split("/")[1] || doc.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const url = getDocumentPublicUrl(doc.url);
                        setPreviewDoc(doc);
                        setPreviewUrl(url);
                      }}
                      className="text-primary font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-primary-fixed/30 transition bg-primary/5 active:scale-90"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        window.open(getDocumentPublicUrl(doc.url), "_blank");
                      }}
                      className="p-1.5 text-on-surface-variant/40 hover:text-primary transition rounded-lg hover:bg-primary/5 hidden md:block"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <h3
                  className="font-bold text-on-surface mb-1 truncate text-base md:text-lg"
                  title={doc.name}
                >
                  {doc.name}
                </h3>
                {doc.eventName && (
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2 opacity-60">
                    Linked to: {doc.eventName}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest pt-4 border-t border-outline-variant/5">
                <span>{doc.size}</span>
                <span>{new Date(doc.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
        {!loading && docs.length === 0 && (
          <div className="col-span-full py-20 text-center text-on-surface-variant/40 border-2 border-dashed border-outline-variant/10 rounded-4xl italic">
            No documents yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-surface-container-lowest sm:rounded-3xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6 h-[60vh] sm:h-auto overflow-y-auto rounded-t-[2.5rem] animate-in slide-in-from-bottom duration-300">
            <h3 className="font-display text-2xl font-black text-on-surface">
              Add Document
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-2 px-1">
                  Document Name (Optional)
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-outline-variant/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-sm"
                  placeholder="e.g., Insurance Policy 2026"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-2 px-1">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-[0.2em] file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer focus:outline-none border border-outline-variant/20 rounded-2xl p-2 bg-surface shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button
                disabled={!selectedFile || loading}
                onClick={() => {
                  if (selectedFile) {
                    handleFiles([selectedFile], newDocName.trim() || undefined);
                    setIsModalOpen(false);
                    setNewDocName("");
                    setSelectedFile(null);
                  }
                }}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:opacity-90 transition shadow-lg shadow-primary/30 disabled:opacity-20 disabled:grayscale flex items-center gap-2"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewDoc(null)}
          />
          <div className="bg-surface-container-lowest sm:rounded-[2.5rem] shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-4xl z-10 p-6 md:p-8 flex flex-col gap-6 h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl md:text-2xl font-black text-on-surface truncate">
                {previewDoc.name}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-surface-container transition text-on-surface-variant/40 hover:text-on-surface"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="border border-outline-variant/10 rounded-3xl bg-surface-container-low min-h-[60vh] overflow-hidden flex items-center justify-center p-2 relative">
              {isImageDoc(previewDoc) ? (
                <img
                  src={previewUrl}
                  alt={previewDoc.name}
                  className="max-h-[75vh] object-contain rounded-2xl shadow-xl"
                />
              ) : isPdfDoc(previewDoc) ? (
                <iframe
                  src={previewUrl}
                  title={previewDoc.name}
                  className="w-full h-[70vh] rounded-2xl shadow-inner bg-white"
                />
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-surface-container-lowest rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-outline-variant/10 text-on-surface-variant/20">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <p className="font-bold text-on-surface mb-2">
                    Preview not available
                  </p>
                  <p className="text-xs font-medium text-on-surface-variant/60 mb-6">
                    We can&apos;t show a preview of this file type yet.
                  </p>
                  <button
                    onClick={() => window.open(previewUrl, "_blank")}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Open in new tab
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
