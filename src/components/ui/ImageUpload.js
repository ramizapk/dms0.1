'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ImageUpload({
    label,
    value,
    onChange,
    onRemove,
    className = "",
    required = false,
    placeholder = "Click or drag to upload image"
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
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
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileSelect = async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, etc)');
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('is_private', 0);
            formData.append('folder', 'Home');

            const response = await api.uploadFile(formData);

            if (response.message && response.message.file_url) {
                onChange(response.message.file_url);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
                {uploading && <span className="text-indigo-600 text-[10px] animate-pulse">Uploading...</span>}
            </label>

            <AnimatePresence mode="wait">
                {value ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center"
                    >
                        <img
                            src={value.startsWith('http') ? value : `https://app.dms.salasah.sa${value}`}
                            alt={label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.png'; // Fallback
                            }}
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button
                                onClick={() => window.open(value.startsWith('http') ? value : `https://app.dms.salasah.sa${value}`, '_blank')}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                title="View Image"
                                type="button"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onRemove}
                                className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                                title="Remove Image"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Uploaded
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3 text-center min-h-[160px]
                                ${isDragging
                                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
                                    : error
                                        ? 'border-red-300 bg-red-50/30 hover:border-red-400'
                                        : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50'
                                }
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />

                            {uploading ? (
                                <div className="flex flex-col items-center gap-3 text-indigo-600">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm font-semibold">Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className={`p-3 rounded-full transition-colors ${error ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                        {error ? <AlertCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700">
                                            {error ? 'Upload failed' : 'Click to upload'}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {error ? error : 'or drag and drop JPG, PNG'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
