import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, FileWarning, FileX, Clock } from 'lucide-react';
import { downloadSharedFile, getSharedFile, ShareApiError } from '../api/shares';
import { Button } from '../components/ui/Button';
import { FileIcon } from '../components/ui/FileIcon';
import { formatFileSize, getFileIconType } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';

interface SharedFileData {
  name: string;
  size?: number;
  contentType?: string;
}

export function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<SharedFileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadSharedFile();
  }, [token]);

  const loadSharedFile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Access the public share endpoint to get file metadata and blob
      // We just need to confirm the share exists; the blob will be used for download
      // The API returns the file metadata through the blob response headers
      setFileInfo({ name: 'loading...' });
      // We'll use the download function to verify the share exists
      // But first, let's just call getSharedFile to validate
      const result = await getSharedFile(token);
      setFileInfo({
        name: result.fileName,
        size: result.contentLength,
        contentType: result.contentType,
      });
    } catch (err) {
      if (err instanceof ShareApiError) {
        const message = err.message;
        if (message.includes('expired')) {
          setError('This share link has expired.');
        } else if (message.includes('revoked')) {
          setError('This share link has been revoked.');
        } else if (message.includes('unavailable')) {
          setError('Share link unavailable');
        } else {
          setError('Share link unavailable');
        }
      } else if (err instanceof Error) {
        setError('Share link unavailable');
      } else {
        setError('Share link unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token) return;
    try {
      await downloadSharedFile(token);
      showToast('success', 'Download started');
    } catch {
      showToast('error', 'Download failed');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: 'var(--spacing-8)',
      }}>
        <div className="public-share-card">
          <div className="skeleton" style={{ width: '64px', height: '64px', margin: '0 auto var(--spacing-6)', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton skeleton-title" style={{ width: '60%', margin: '0 auto var(--spacing-2)' }} />
          <div className="skeleton skeleton-text" style={{ width: '80%', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (error) {
    const isExpired = error.includes('expired');
    const isRevoked = error.includes('revoked');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: 'var(--spacing-8)',
      }}>
        <div className="public-share-card public-share-error">
          {isExpired ? (
            <Clock className="public-share-error-icon" size={48} aria-hidden="true" />
          ) : isRevoked ? (
            <FileX className="public-share-error-icon" size={48} aria-hidden="true" />
          ) : (
            <FileWarning className="public-share-error-icon" size={48} aria-hidden="true" />
          )}
          <h2 className="public-share-error-title">{error}</h2>
          <p className="public-share-error-description">
            {isExpired
              ? 'This share link has expired.'
              : isRevoked
              ? 'This share link has been revoked.'
              : 'The share link you are looking for is not available.'}
          </p>
          <Link to="/">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!fileInfo) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: 'var(--spacing-8)',
    }}>
      <div className="public-share-card">
        <div className="public-share-icon">
          <FileIcon type={getFileIconType(fileInfo.name)} size="lg" />
        </div>

        <h1 className="public-share-title">{fileInfo.name}</h1>
        <p className="public-share-description">
          This file has been shared with you.
        </p>

        <div className="public-share-file-info">
          {fileInfo.size && (
            <div className="public-share-file-item">
              <span className="public-share-file-label">Size</span>
              <span className="public-share-file-value">{formatFileSize(fileInfo.size)}</span>
            </div>
          )}
          {fileInfo.contentType && (
            <div className="public-share-file-item">
              <span className="public-share-file-label">Type</span>
              <span className="public-share-file-value">{fileInfo.contentType}</span>
            </div>
          )}
        </div>

        <Button variant="primary" size="lg" onClick={handleDownload} style={{ width: '100%' }}>
          <Download size={20} aria-hidden="true" />
          Download File
        </Button>
      </div>
    </div>
  );
}