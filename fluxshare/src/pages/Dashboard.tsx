import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePlus, FolderOpen } from 'lucide-react';
import type { FileData, FileStats } from '../types';
import { getFiles, getStats } from '../api/files';
import { UploadDropzone } from '../components/files/UploadDropzone';
import { StatsCards } from '../components/files/StatsCards';
import { FileTable } from '../components/files/FileTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { downloadFile, deleteFile as deleteFileById } from '../api/files';

export function Dashboard() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [filesData, statsData] = await Promise.all([getFiles(), getStats()]);
      setFiles(filesData);
      setStats(statsData);
    } catch (error) {
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    // Navigate to upload page and pass files via navigation state
    navigate('/upload', { state: { files: selectedFiles } });
  };

  const handleDownload = async (file: FileData) => {
    try {
      await downloadFile(file);
      showToast('success', 'Download started');
    } catch {
      showToast('error', 'Download failed');
    }
  };

  const handleDelete = async (file: FileData) => {
    try {
      await deleteFileById(file.id);
      setFiles(files.filter((f) => f.id !== file.id));
      showToast('success', 'File deleted');
    } catch {
      showToast('error', 'Failed to delete file');
    }
  };

  const recentFiles = files.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div>
        <Skeleton variant="title" width="30%" />
        <Skeleton variant="text" width="50%" className="mt-2 mb-8" />
        <Skeleton height="300px" className="mb-8" />
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">{getGreeting()}</h1>
        <p className="text-gray-500">Manage your files and transfers.</p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <UploadDropzone onFilesSelected={handleFilesSelected} />
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <h2 className="mb-4">Overview</h2>
          <StatsCards stats={stats} />
        </div>
      )}

      {/* Recent Files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Recent Files</h2>
          <Link to="/files">
            <Button variant="ghost" size="sm">
              <FolderOpen size={16} aria-hidden="true" />
              View All
            </Button>
          </Link>
        </div>

        {recentFiles.length === 0 ? (
          <EmptyState
            icon={FilePlus}
            title="You don't have any files yet"
            description="Upload your first file to get started."
            action={
              <Link to="/upload">
                <Button variant="primary">
                  <FilePlus size={20} aria-hidden="true" />
                  Upload File
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="card">
            <FileTable
              files={recentFiles}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
