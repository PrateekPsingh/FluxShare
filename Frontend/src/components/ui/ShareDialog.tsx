import { useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import { Button } from './Button';
import type { FileData } from '../../types';

interface ShareDialogProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateShare: (expiresInHours: number) => Promise<void>;
  creatingShare: boolean;
  shareUrl: string | null;
  onCopyLink: () => void;
}

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '24 hours', value: 24 },
  { label: '7 days', value: 168 },
  { label: '30 days', value: 720 },
];

export function ShareDialog({
  file,
  isOpen,
  onClose,
  onCreateShare,
  creatingShare,
  shareUrl,
  onCopyLink,
}: ShareDialogProps) {
  const [selectedExpiresIn, setSelectedExpiresIn] = useState<number>(1);

  if (!isOpen || !file) return null;

  const handleCreate = async () => {
    await onCreateShare(selectedExpiresIn);
  };

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dialog" style={{ maxWidth: '480px' }}>
        <div className="dialog-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Share2 className="text-primary-600" size={20} aria-hidden="true" />
            </div>
            <h2 id="share-dialog-title" className="dialog-title">
              Share File
            </h2>
          </div>
          <p className="dialog-description">{file.name}</p>
        </div>

        <div className="dialog-description" style={{ marginBottom: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
            File Size: {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
          </span>
        </div>

        {!shareUrl ? (
          <>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-gray-700)',
                  marginBottom: 'var(--spacing-2)',
                }}
              >
                Expiration
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  flexWrap: 'wrap',
                }}
              >
                {EXPIRATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`filter-tab ${selectedExpiresIn === option.value ? 'active' : ''}`}
                    onClick={() => setSelectedExpiresIn(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="dialog-footer" style={{ marginTop: 0 }}>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={creatingShare}
              >
                {creatingShare ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: 'var(--spacing-3)',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-4)',
                wordBreak: 'break-all',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-primary-600)',
                border: '1px solid var(--color-gray-200)',
              }}
            >
              {shareUrl}
            </div>

            <div className="dialog-footer" style={{ marginTop: 0 }}>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" onClick={onCopyLink}>
                <Copy size={16} aria-hidden="true" />
                Copy Link
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}