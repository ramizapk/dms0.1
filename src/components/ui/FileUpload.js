'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function FileUpload({
    docName,
    onAllUploadsComplete,
    className = "",
    multiple = true
}) {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const fileObjects = newFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: 'pending', // pending, uploading, success, error
            progress: 0,
            error: null
        }));
        setFiles(prev => [...prev, ...fileObjects]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadFiles = async () => {
        setUploading(true);
        let completedCount = 0;
        let hasErrors = false;

        const filesToUpload = files.filter(f => f.status !== 'success');

        for (const fileObj of filesToUpload) {
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f));

            try {
                const formData = new FormData();
                formData.append('file', fileObj.file);
                formData.append('doctype', 'Masar Document');
                formData.append('docname', docName);

                // You might need these if the API strictly requires them, 
                // based on previous requests usually is_private=0/1 and sometimes folder
                formData.append('is_private', 0);
                formData.append('folder', 'Home');

                await api.uploadFile(formData);

                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
            } catch (err) {
                console.error(`Failed to upload ${fileObj.file.name}`, err);
                hasErrors = true;
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: err.message || 'Upload failed' } : f));
            }
            completedCount++;
        }

        setUploading(false);
        if (!hasErrors) {
            if (onAllUploadsComplete) onAllUploadsComplete();
        }
    };

    const totalFiles = files.length;
    const uploadedFiles = files.filter(f => f.status === 'success').length;
    const isAllSuccess = totalFiles > 0 && uploadedFiles === totalFiles;

    return (
        <div className={`space-y-6 ${className}`}>
            <motion.div
                layout
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={!uploading ? handleDragOver : undefined}
                onDragLeave={!uploading ? handleDragLeave : undefined}
                onDrop={!uploading ? handleDrop : undefined}
                className={`
                    relative border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 text-center min-h-[200px]
                    ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
                        : uploading
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white shadow-lg shadow-indigo-500/10 text-indigo-500'}`}>
                    <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800">
                        {isDragging ? 'Drop files here' : 'Click or drop files to upload'}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                        Support for multiple files
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                Selected Files ({uploadedFiles}/{totalFiles})
                            </h4>
                            {!uploading && !isAllSuccess && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-xs font-bold text-red-500 hover:text-red-600"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {files.map((fileObj) => (
                                <motion.div
                                    key={fileObj.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`
                                        relative overflow-hidden rounded-xl border p-3 flex items-center gap-3 bg-white
                                        ${fileObj.status === 'error' ? 'border-red-200' : fileObj.status === 'success' ? 'border-emerald-200' : 'border-slate-100'}
                                    `}
                                >
                                    {/* Progress Background */}
                                    {fileObj.status === 'uploading' && (
                                        <motion.div
                                            className="absolute inset-0 bg-indigo-50/50 origin-left"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }} // Indeterminate for now as we don't have real progress event from fetch
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}

                                    <div className={`p-2 rounded-lg shrink-0 ${fileObj.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0 relative">
                                        <p className="text-sm font-bold text-slate-700 truncate">{fileObj.file.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                                            {fileObj.status === 'error' && <span className="text-red-500 ml-2">{fileObj.error}</span>}
                                        </p>
                                    </div>

                                    <div className="relative shrink-0">
                                        {fileObj.status === 'uploading' ? (
                                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                        ) : fileObj.status === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : fileObj.status === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <button
                                                onClick={() => removeFile(fileObj.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end pt-4">
                <button
                    onClick={uploadFiles}
                    disabled={uploading || files.length === 0 || isAllSuccess}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all
                        ${uploading || files.length === 0 || isAllSuccess
                            ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95'
                        }
                    `}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload Files
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
