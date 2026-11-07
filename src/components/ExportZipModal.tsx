import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ExportZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportZipModal: React.FC<ExportZipModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/download-zip`
      : '/api/download-zip';

  // Method 1: In-memory Blob download (reliable inside iframes)
  const handleBlobDownload = async () => {
    setIsDownloading(true);
    setErrorMessage(null);
    sounds.playTap();

    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'befittracker-project.zip';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(link);
      }, 1000);

      sounds.playSuccess();
      setDownloadSuccess(true);
    } catch (err: any) {
      console.warn('Blob download encountered an issue:', err);
      // Fallback: direct window navigation
      try {
        window.location.assign('/api/download-zip');
      } catch {
        setErrorMessage(
          'Browser iframe sandbox blocked direct file saving. Please use Method 2 below to open the direct link.'
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    sounds.playTap();
    navigator.clipboard.writeText(downloadUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Download BeFit Tracker Project
              </h2>
              <p className="text-xs text-slate-500">
                Complete source code, images, full-stack server & configs (2.4 MB)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Method 1: Primary 1-Click Blob Downloader */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Method 1: Instant In-App Download
              </span>
              <span className="text-[11px] font-mono text-slate-400">2.4 MB ZIP</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Downloads the pre-compiled `.zip` file directly to your computer or phone downloads folder.
            </p>

            <button
              onClick={handleBlobDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing & Downloading...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded! Check Downloads Folder</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download befittracker-project.zip</span>
                </>
              )}
            </button>
          </div>

          {/* Error notice if browser blocked iframe download */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200">
              {errorMessage}
            </div>
          )}

          {/* Method 2: Direct Standalone Link (Bypasses iframe restrictions) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Method 2: Direct URL (If Iframe Sandbox Blocks File Saving)
            </span>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copy or open the direct server URL in a new tab to bypass any browser preview iframe download restrictions:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 truncate select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1 shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
