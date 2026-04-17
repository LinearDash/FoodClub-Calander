"use client";
import React, { useState, useRef } from "react";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([
    { id: 1, name: "Public Liability Insurance 2026.pdf", type: "PDF", size: "2.4 MB", date: "2026-01-10T00:00:00.000Z" },
    { id: 2, name: "Menu Options Spring Carnival.docx", type: "DOCX", size: "1.1 MB", date: "2026-03-05T00:00:00.000Z" },
    { id: 3, name: "Stall Setup Diagram.jpg", type: "IMAGE", size: "3.5 MB", date: "2026-02-20T00:00:00.000Z" },
    { id: 4, name: "Supplier Contacts List.xlsx", type: "EXCEL", size: "800 KB", date: "2026-01-15T00:00:00.000Z" },
    { id: 5, name: "Health & Safety Guidelines.pdf", type: "PDF", size: "4.2 MB", date: "2026-02-05T00:00:00.000Z" },
    { id: 6, name: "Marketing Assets Zip.zip", type: "ZIP", size: "14.5 MB", date: "2026-03-25T00:00:00.000Z" }
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = (files: File[], forcedName?: string) => {
    const newDocs = files.map((file, i) => ({
      id: Date.now() + i,
      name: forcedName || file.name,
      type: file.name.split('.').pop()?.toUpperCase() || "FILE",
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      date: new Date().toISOString()
    }));
    setDocs(prev => [...newDocs, ...prev]);
  };

  return (
    <div 
      className={`relative min-h-[80vh] space-y-8 pb-12 transition-colors duration-200 rounded-3xl ${isDragging ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary pointer-events-none">
          <div className="text-2xl font-display font-bold text-primary flex flex-col items-center gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Drop files here to upload
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2 pt-2">
        <h1 className="font-display text-4xl font-bold text-on-surface">Documents</h1>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
        >
          + Add Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {docs.map(doc => (
          <div key={doc.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-[0_4px_20px_rgba(29,28,24,0.03)] hover:shadow-[0_8px_30px_rgba(29,28,24,0.08)] transition group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-surface-container-low text-on-surface rounded-xl flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-outline-variant/30 px-1 truncate text-center">
                  {doc.type}
                </div>
                <button 
                  onClick={() => alert(`Downloading ${doc.name}...`)}
                  className="text-primary hover:text-primary-container font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-primary-fixed/30 transition flex items-center gap-1 bg-primary/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  DL
                </button>
              </div>
              <h3 className="font-semibold text-on-surface mb-2 truncate" title={doc.name}>{doc.name}</h3>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium pt-4 border-t border-surface-container-low mt-2">
              <span>{doc.size}</span>
              <span>{new Date(doc.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
           <div className="col-span-full py-12 text-center text-on-surface-variant border-2 border-dashed border-outline-variant/30 rounded-2xl">
             No documents uploaded yet. Drag and drop files here.
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-on-surface">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Document Name (Optional)</label>
                <input 
                  type="text" 
                  value={newDocName} 
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
                  placeholder="e.g., Insurance Policy 2026"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Select File</label>
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-container-highest cursor-pointer focus:outline-none border border-outline-variant/30 rounded-xl p-1 bg-surface"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/15">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button 
                disabled={!selectedFile}
                onClick={() => {
                  if (selectedFile) {
                    handleFiles([selectedFile], newDocName.trim() || undefined);
                    setIsModalOpen(false);
                    setNewDocName("");
                    setSelectedFile(null);
                  }
                }}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
