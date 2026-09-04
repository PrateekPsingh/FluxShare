import { FileText, Image, FileArchive, Video, Music, File } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';

interface FileIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FileIcon({ type, size = 'md' }: FileIconProps) {
  const iconType = getFileIcon(type);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 20;

  const colorClasses = {
    pdf: 'file-icon-pdf',
    image: 'file-icon-image',
    zip: 'file-icon-zip',
    video: 'file-icon-image',
    audio: 'file-icon-zip',
    document: '',
    spreadsheet: '',
    presentation: '',
    file: '',
  };

  const iconMap = {
    pdf: FileText,
    image: Image,
    zip: FileArchive,
    video: Video,
    audio: Music,
    document: FileText,
    spreadsheet: FileText,
    presentation: FileText,
    file: File,
  };

  const Icon = iconMap[iconType as keyof typeof iconMap] || File;

  return (
    <div className={`file-icon ${colorClasses[iconType as keyof typeof colorClasses] || ''} ${sizeClasses[size]}`}>
      <Icon size={iconSize} aria-hidden="true" />
    </div>
  );
}
