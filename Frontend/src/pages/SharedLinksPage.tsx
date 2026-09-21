import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Copy, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { listShares, revokeShare } from '../api/shares';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Share } from '../types';
import { formatDate, formatFullDate, getFileType } from '../utils/fileUtils';
import { FileIcon } from '../components/ui/FileIcon';

export function SharedLinksPage() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<Share | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const data = await listShares();
      setShares(data.filter((share) => share.revoked_at === null || share.revoked_at === undefined));
    } catch {
      // ponytail: 0 shares = empty, not error
      setShares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = new URL(url, window.location.origin).toString();
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('success', 'Share link copied');
    }).catch(() => {
      showToast('error', 'Failed to copy link');
    });
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevokingId(revokeTarget.id);
    try {
      await revokeShare(revokeTarget.id);
      setShares((prev) =>
        prev.map((s) =>
          s.id === revokeTarget.id ? { ...s, revoked_at: new Date().toISOString() } : s
        )
      );
      showToast('success', 'Share link revoked');
      setRevokeTarget(null);
    } catch {
      showToast('error', 'Failed to revoke share link');
    } finally {
      setRevokingId(null);
    }
  };

  const getShareStatus = (share: Share) => {
    if (share.revoked_at !== null && share.revoked_at !== undefined) {
      return 'revoked' as const;
    }
    if (share.expires_at) {
      const expiresAt = new Date(share.expires_at).getTime();
      if (Date.now() > expiresAt) {
        return 'expired' as const;
      }
    }
    return 'active' as const;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'revoked':
        return 'Revoked';
      case 'expired':
        return 'Expired';
      default:
        return 'Active';
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'revoked':
        return 'badge-revoked';
      case 'expired':
        return 'badge-expired';
      default:
        return 'badge-active';
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ width: '30%', marginBottom: 'var(--spacing-2)' }}>
          <div className="skeleton skeleton-title" />
        </div>
        <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 'var(--spacing-8)' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '80px', marginBottom: 'var(--spacing-3)' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="shared-links-header">
        <div>
          <h1>Shared Links</h1>
          <p style={{ color: 'var(--color-gray-500)' }}>Links you have created for your files.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadShares}>
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {shares.length === 0 ? (
        <div className="empty-state">
          <Share2 className="empty-state-icon" size={64} aria-hidden="true" />
          <h3 className="empty-state-title">No shared links yet</h3>
          <p className="empty-state-description">
            Share files with others by clicking the Share button on your files.
          </p>
          <Link to="/files">
            <Button variant="primary">
              <Share2 size={20} aria-hidden="true" />
              Share a File
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          {shares.map((share) => {
            const status = getShareStatus(share);
            return (
              <div key={share.id} className="shared-link-card">
                <FileIcon type={getFileType(share.file_name || '')} />
                <div className="shared-link-info">
                  <div className="shared-link-file-name">{share.file_name}</div>
                  <div className="shared-link-meta">
                    <span className={`badge ${getStatusClassName(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <span>Created: {share.created_at ? formatDate(share.created_at) : '—'}</span>
                    <span>Expires: {share.expires_at ? formatFullDate(new Date(share.expires_at)) : 'Never'}</span>
                    {share.revoked_at && (
                      <span>Revoked: {formatDate(share.revoked_at)}</span>
                    )}
                    <span className="shared-link-url">{share.share_url ? new URL(share.share_url, window.location.origin).toString() : '—'}</span>
                  </div>
                </div>
                <div className="shared-link-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(share.share_url)}
                    aria-label={`Copy link for ${share.file_name}`}
                  >
                    <Copy size={16} aria-hidden="true" />
                  </Button>
                  {status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevokeTarget(share)}
                      aria-label={`Revoke link for ${share.file_name}`}
                      disabled={revokingId === share.id}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!revokeTarget}
        title="Revoke share link?"
        message="Anyone with this link will no longer be able to access the file."
        confirmLabel="Revoke Link"
        variant="danger"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}