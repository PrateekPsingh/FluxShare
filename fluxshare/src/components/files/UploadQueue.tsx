import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { UploadFile } from '../../types';
import { formatFileSize, getFileType } from '../../utils/fileUtils';
import { FileIcon } from '../ui/FileIcon';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

interface UploadQueueProps {
  files: UploadFile[];
  onRemove: (id: string) => void;
  isUploading: boolean;
}

export function UploadQueue({ files, onRemove, isUploading }: UploadQueueProps) {
  if (files.length === 0) return null;

  return (
    <div className="upload-list">
      {files.map((file) => (
        <div key={file.id} className="upload-item">
          <FileIcon type={getFileType(file.name)} size="sm" />

          <div className="upload-item-info">
            <span className="upload-item-name">{file.name}</span>
            <div className="upload-item-meta">
              <span>{formatFileSize(file.size)}</span>
              {file.status === 'ready' && <span className="badge badge-uploading">Ready</span>}
              {file.status === 'uploading' && (
                <>
                  <span className="badge badge-uploading">
                    <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                    Uploading
                  </span>
                </>
              )}
              {file.status === 'uploaded' && (
                <span className="badge badge-uploaded">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  Uploaded
                </span>
              )}
              {file.status === 'failed' && (
                <span className="badge badge-failed">
                  <AlertCircle size={12} aria-hidden="true" />
                  Failed
                </span>
              )}
            </div>
          </div>

          {(file.status === 'uploading' || file.status === 'uploaded') && (
            <div className="upload-item-progress">
              <ProgressBar progress={file.progress} />
              <span className="text-xs text-gray-500 mt-1">{file.progress}%</span>
            </div>
          )}

          {file.status === 'failed' && file.error && (
            <span className="text-xs text-red-600">{file.error}</span>
          )}

          {!isUploading && file.status !== 'uploaded' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.id)}
              aria-label={`Remove ${file.name}`}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
