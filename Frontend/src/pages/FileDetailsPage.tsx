import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import type { FileData } from '../types';
import { getFile, downloadFile, deleteFile as deleteFileById } from '../api/files';
import { FileIcon } from '../components/ui/FileIcon';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { formatFileSize, formatFullDate, getFileType } from '../utils/fileUtils';

export function FileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadFile();
  }, [id]);

  const loadFile = async () => {
    if (!id) return;

    try {
      const data = await getFile(id);
      setFile(data);
    } catch {
      showToast('error', 'File not found');
      navigate('/files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      await downloadFile(file);
      showToast('success', 'Download started');
    } catch {
      showToast('error', 'Download failed');
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    try {
      await deleteFileById(file.id);
      showToast('success', 'File deleted');
      navigate('/files');
    } catch {
      showToast('error', 'Failed to delete file');
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div>
        <Skeleton variant="text" width="20%" className="mb-6" />
        <Skeleton height="200px" className="mb-6" />
        <Skeleton height="150px" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <h2>File not found</h2>
        <p className="text-gray-500 mt-2">This file may have been deleted.</p>
        <Link to="/files" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Files
          </Button>
        </Link>
      </div>
    );
  }

  const fileType = getFileType(file.name);

  return (
    <div>
      {/* Back Link */}
      <Link to="/files" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} aria-hidden="true" />
        Back to Files
      </Link>

      {/* File Details Header */}
      <div className="card mb-6">
        <div className="file-details">
          <div className="file-details-header">
            <div className="file-details-icon">
              <FileIcon type={fileType} size="lg" />
            </div>
            <div className="file-details-info">
              <h1 className="file-details-name">{file.name}</h1>
              <p className="file-details-type">{fileType.toUpperCase()} Document</p>
              <div className="file-details-actions">
                <Button variant="primary" onClick={handleDownload}>
                  <Download size={20} aria-hidden="true" />
                  Download
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 size={20} aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Information */}
      <div className="card">
        <h2 className="mb-4">File Information</h2>

        <div className="file-details-section">
          <div className="file-details-grid">
            <div className="file-details-item">
              <span className="file-details-label">Name</span>
              <span className="file-details-value">{file.name}</span>
            </div>

            <div className="file-details-item">
              <span className="file-details-label">Size</span>
              <span className="file-details-value">{formatFileSize(file.size)}</span>
            </div>

            <div className="file-details-item">
              <span className="file-details-label">Type</span>
              <span className="file-details-value">{file.type}</span>
            </div>

            <div className="file-details-item">
              <span className="file-details-label">Status</span>
              <StatusBadge status={file.status} progress={file.progress} />
            </div>

            <div className="file-details-item">
              <span className="file-details-label">Upload Date</span>
              <span className="file-details-value">{formatFullDate(file.uploadDate)}</span>
            </div>

            {file.error && (
              <div className="file-details-item">
                <span className="file-details-label">Error</span>
                <span className="file-details-value text-red-600">{file.error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={`Delete ${file.name}?`}
        message="This file will be permanently deleted."
        confirmLabel="Delete File"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
