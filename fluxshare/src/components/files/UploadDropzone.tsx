import { useCallback, useState } from 'react';
import { Upload, FilePlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { MAX_FILE_SIZE_MB } from '../../api/files';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export function UploadDropzone({ onFilesSelected, multiple = true }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  }, [onFilesSelected, multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div
      className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Upload files"
      onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple={multiple}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <Upload className="upload-dropzone-icon" size={48} aria-hidden="true" />

      <h3 className="upload-dropzone-title">
        {isDragActive ? 'Drop files here' : 'Upload your files'}
      </h3>

      <p className="upload-dropzone-subtitle">
        {isDragActive ? 'Release to upload' : 'Drag & drop files here'}
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById('file-input')?.click();
        }}
      >
        <FilePlus size={20} aria-hidden="true" />
        Choose Files
      </Button>

      <p className="upload-dropzone-hint">
        Maximum file size: {MAX_FILE_SIZE_MB} MB
      </p>
    </div>
  );
}
