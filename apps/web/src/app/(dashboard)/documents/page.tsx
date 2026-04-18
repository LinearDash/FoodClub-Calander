"use client";
import React, { useState, useRef, useEffect } from "react";
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

  const loadData = async () => {
    setLoading(true);
    const data = await getGlobalDocuments();
    setDocs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFiles = async (files: File[], forcedName?: string) => {
    setLoading(true);
    const supabase = createClient();

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = forcedName || file.name;
      const filePath = `global/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        alert(`Upload Failed: ${uploadError.message}. Make sure you have a public bucket named "documents" in Supabase.`);
        setLoading(false);
        return;
      }

      // Save to DB
      const result = await saveDocumentRecord('', filePath, fileName, file.type, formatFileSize(file.size));
      
      if (result?.error) {
        alert(`Database Save Failed: ${result.error}. The file was uploaded to storage, but the record wasn't created.`);
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
  const isPdfDoc = (doc: Doc) => doc.type.toLowerCase().includes("pdf") || doc.name.toLowerCase().endsWith(".pdf");

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
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-on-surface-variant font-medium">
            Loading your business library...
          </div>
        ) : docs.map(doc => (
          <div key={doc.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-[0_4px_20px_rgba(29,28,24,0.03)] hover:shadow-[0_8px_30px_rgba(29,28,24,0.08)] transition group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-surface-container-low text-on-surface rounded-xl flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-outline-variant/30 px-1 truncate text-center">
                  {doc.type}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const url = getDocumentPublicUrl(doc.url);
                      setPreviewDoc(doc);
                      setPreviewUrl(url);
                    }}
                    className="text-primary hover:text-primary-container font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-primary-fixed/30 transition bg-primary/5"
                  >
                    PREVIEW
                  </button>
                  <button 
                    onClick={() => {
                      window.open(getDocumentPublicUrl(doc.url), '_blank');
                    }}
                    className="text-primary hover:text-primary-container font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-primary-fixed/30 transition flex items-center gap-1 bg-primary/5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    OPEN
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-on-surface mb-1 truncate" title={doc.name}>{doc.name}</h3>
              {doc.eventName && (
                <p className="text-[10px] font-bold text-primary uppercase mb-2">Linked to: {doc.eventName}</p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium pt-4 border-t border-surface-container-low mt-2">
              <span>{doc.size}</span>
              <span>{new Date(doc.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {!loading && docs.length === 0 && (
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
                disabled={!selectedFile || loading}
                onClick={() => {
                  if (selectedFile) {
                    handleFiles([selectedFile], newDocName.trim() || undefined);
                    setIsModalOpen(false);
                    setNewDocName("");
                    setSelectedFile(null);
                  }
                }}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setPreviewDoc(null)} />
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-4xl z-10 p-6 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-on-surface truncate">{previewDoc.name}</h3>
              <button onClick={() => setPreviewDoc(null)} className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface">Close</button>
            </div>
            <div className="border border-outline-variant/20 rounded-xl bg-surface min-h-[60vh] overflow-hidden flex items-center justify-center p-3">
              {isImageDoc(previewDoc) ? (
                <img src={previewUrl} alt={previewDoc.name} className="max-h-[75vh] object-contain rounded-lg" />
              ) : isPdfDoc(previewDoc) ? (
                <iframe src={previewUrl} title={previewDoc.name} className="w-full h-[70vh] rounded-lg" />
              ) : (
                <div className="text-center text-on-surface-variant">
                  <p>No inline preview for this file type.</p>
                  <button onClick={() => window.open(previewUrl, "_blank")} className="mt-3 text-primary font-medium">Open in new tab</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
