import { Download, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FileData } from '../../types';
import { formatFileSize, formatDate, getFileType } from '../../utils/fileUtils';
import { StatusBadge } from '../ui/StatusBadge';
import { FileIcon } from '../ui/FileIcon';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface FileTableProps {
  files: FileData[];
  onDownload: (file: FileData) => void;
  onDelete: (file: FileData) => void;
}

export function FileTable({ files, onDownload, onDelete }: FileTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<FileData | null>(null);

  const handleDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
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
    </>
  );
}
