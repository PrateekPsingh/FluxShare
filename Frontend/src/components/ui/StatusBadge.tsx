import type { FileStatus } from '../../types';
import { CheckCircle2, AlertCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: FileStatus;
  progress?: number;
}

export function StatusBadge({ status, progress }: StatusBadgeProps) {
  const config: Record<FileStatus, { icon: typeof Loader2; className: string; label: string; animate?: boolean }> = {
    uploading: {
      icon: Loader2,
      className: 'badge-uploading',
      label: 'Uploading',
      animate: true,
    },
    uploaded: {
      icon: CheckCircle2,
      className: 'badge-uploaded',
      label: 'Uploaded',
    },
    processing: {
      icon: Clock,
      className: 'badge-processing',
      label: 'Processing',
    },
    failed: {
      icon: XCircle,
      className: 'badge-failed',
      label: 'Failed',
    },
    downloading: {
      icon: Loader2,
      className: 'badge-uploading',
      label: 'Downloading',
      animate: true,
    },
    deleted: {
      icon: AlertCircle,
      className: 'badge-failed',
      label: 'Deleted',
    },
  };

  const { icon: Icon, className, label, animate } = config[status];

  return (
    <span className={`badge ${className}`}>
      <Icon size={12} className={animate ? 'animate-spin' : ''} aria-hidden="true" />
      <span>{label}</span>
      {status === 'uploading' && progress !== undefined && (
        <span>{progress}%</span>
      )}
    </span>
  );
}
