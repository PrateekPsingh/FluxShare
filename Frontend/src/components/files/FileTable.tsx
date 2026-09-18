import { Download, Trash2, Eye, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FileData } from '../../types';
import { formatFileSize, formatDate, getFileType } from '../../utils/fileUtils';
import { StatusBadge } from '../ui/StatusBadge';
import { FileIcon } from '../ui/FileIcon';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ShareDialog } from '../ui/ShareDialog';
import { createShare } from '../../api/shares';
import { useToast } from '../../context/ToastContext';

interface FileTableProps {
  files: FileData[];
  onDownload: (file: FileData) => void;
  onDelete: (file: FileData) => void;
}

export function FileTable({ files, onDownload, onDelete }: FileTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<FileData | null>(null);
  const [shareTarget, setShareTarget] = useState<FileData | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleShareClick = (file: FileData) => {
    setShareTarget(file);
    setShareUrl(null);
  };

  const handleCreateShare = async (expiresInHours: number) => {
    if (!shareTarget) return;
    setCreatingShare(true);
    try {
      const response = await createShare(shareTarget.id, expiresInHours);
      const fullUrl = new URL(response.share_url, window.location.origin).toString();
      setShareUrl(fullUrl);
      showToast('success', 'Share link created');
    } catch {
      showToast('error', 'Failed to create share link');
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('success', 'Share link copied');
    } catch {
      showToast('error', 'Failed to copy link');
    }
  };

  return (
    <>
      <div className="file-table-wrapper">
        <table className="file-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Size</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>
                  <Link to={`/files/${file.id}`} className="file-info">
                    <FileIcon type={getFileType(file.name)} />
                    <div>
                      <span className="file-name">{file.name}</span>
                    </div>
                  </Link>
                </td>
                <td>{getFileType(file.name).toUpperCase()}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>
                  <StatusBadge status={file.status} progress={file.progress} />
                </td>
                <td>{formatDate(file.uploadDate)}</td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(file)}
                      aria-label={`Download ${file.name}`}
                    >
                      <Download size={16} aria-hidden="true" />
                    </Button>
                    <Link to={`/files/${file.id}`}>
                      <Button variant="ghost" size="sm" aria-label={`View ${file.name}`}>
                        <Eye size={16} aria-hidden="true" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareClick(file)}
                      aria-label={`Share ${file.name}`}
                    >
                      <Share2 size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(file)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="file-cards">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-card-header">
              <FileIcon type={getFileType(file.name)} />
              <div className="file-card-info">
                <Link to={`/files/${file.id}`} className="file-name">
                  {file.name}
                </Link>
                <p className="file-meta">
                  {getFileType(file.name).toUpperCase()} · {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={file.status} progress={file.progress} />
              <span className="text-sm text-gray-500">{formatDate(file.uploadDate)}</span>
            </div>
            <div className="file-card-actions">
              <Button variant="primary" size="sm" onClick={() => onDownload(file)}>
                <Download size={16} aria-hidden="true" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShareClick(file)}>
                <Share2 size={16} aria-hidden="true" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(file)}>
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        message="This file will be permanently deleted."
        confirmLabel="Delete File"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ShareDialog
        file={shareTarget}
        isOpen={!!shareTarget}
        onClose={() => {
          setShareTarget(null);
          setShareUrl(null);
        }}
        onCreateShare={handleCreateShare}
        creatingShare={creatingShare}
        shareUrl={shareUrl}
        onCopyLink={handleCopyLink}
      />
    </>
  );
}
