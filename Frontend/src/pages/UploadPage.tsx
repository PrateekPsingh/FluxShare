import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { UploadFile } from '../types';
import { uploadFile } from '../api/files';
import { UploadDropzone } from '../components/files/UploadDropzone';
import { UploadQueue } from '../components/files/UploadQueue';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { generateId } from '../utils/fileUtils';

export function UploadPage() {
  const { showToast } = useToast();
  const location = useLocation();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Read files from navigation state on mount
  useEffect(() => {
    const state = location.state as { files?: File[] } | undefined;
    if (state?.files && state.files.length > 0) {
      const newFiles: UploadFile[] = state.files.map((file) => ({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready' as const,
        progress: 0,
      }));
      setFiles(newFiles);
      setIsComplete(false);
    }
  }, [location]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: UploadFile[] = selectedFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setIsComplete(false);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let allSuccessful = true;

    for (const file of files) {
      if (file.status === 'uploaded') continue;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' as const } : f))
      );

      try {
        await uploadFile(file.file, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        });

        // Mark as uploaded
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'uploaded' as const, progress: 100 } : f
          )
        );
      } catch (error) {
        allSuccessful = false;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'failed' as const, error: 'Upload failed. Please try again.' }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    if (allSuccessful) {
      setIsComplete(true);
      showToast('success', 'All files uploaded successfully');
    } else {
      showToast('error', 'Some files failed to upload');
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setIsComplete(false);
  };

  if (isComplete && files.every((f) => f.status === 'uploaded')) {
    return (
      <div>
        {/* Success State */}
        <div className="success-state mb-8">
          <CheckCircle2 className="success-state-icon" size={48} aria-hidden="true" />
          <h2 className="success-state-title">Upload complete</h2>
          <p className="success-state-description">
            Your files have been uploaded successfully.
          </p>
        </div>

        {/* Uploaded Files Summary */}
        <div className="card mb-8">
          <h3 className="mb-4">Uploaded Files</h3>
          <UploadQueue files={files} onRemove={() => {}} isUploading={false} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/files">
            <Button variant="primary">
              <ArrowLeft size={20} aria-hidden="true" />
              View Files
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleCancel}>
            Upload More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Upload files</h1>
        <p className="text-gray-500">Choose the files you want to share.</p>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <UploadDropzone onFilesSelected={handleFilesSelected} />
      </div>

      {/* File Queue */}
      <UploadQueue
        files={files}
        onRemove={handleRemoveFile}
        isUploading={isUploading}
      />

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={isUploading || files.every((f) => f.status === 'uploaded')}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  );
}
