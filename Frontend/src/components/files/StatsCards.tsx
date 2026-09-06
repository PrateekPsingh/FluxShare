import { FileText, Upload as UploadIcon, Download, HardDrive } from 'lucide-react';
import type { FileStats } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface StatsCardsProps {
  stats: FileStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      icon: FileText,
      label: 'Files',
      value: stats.totalFiles,
      iconClass: 'stat-icon-blue',
    },
    {
      icon: UploadIcon,
      label: 'Uploaded',
      value: stats.uploadedFiles,
      iconClass: 'stat-icon-green',
    },
    {
      icon: Download,
      label: 'Downloaded',
      value: stats.downloadedFiles,
      iconClass: 'stat-icon-orange',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: formatFileSize(stats.storageUsed),
      iconClass: 'stat-icon-red',
    },
  ];

  return (
    <div className="stats-grid">
      {statItems.map(({ icon: Icon, label, value, iconClass }) => (
        <div key={label} className="stat-card">
          <div className={`stat-icon ${iconClass}`}>
            <Icon size={20} aria-hidden="true" />
          </div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
