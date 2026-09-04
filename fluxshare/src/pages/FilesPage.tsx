import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilePlus, Search } from 'lucide-react';
import type { FileData, FileFilter } from '../types';
import { getFiles, downloadFile, deleteFile as deleteFileById } from '../api/files';
import { FileTable } from '../components/files/FileTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export function FilesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState<FileFilter>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch {
      showToast('error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const filteredFiles = files.filter((file) => {
    // Filter by status
    if (activeFilter !== 'all' && file.status !== activeFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        file.name.toLowerCase().includes(query) ||
        file.type.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div>
        <Skeleton variant="title" width="30%" />
        <Skeleton variant="text" width="50%" className="mt-2 mb-8" />
        <div className="flex gap-3 mb-6">
          <Skeleton width="100px" height="40px" />
          <Skeleton width="200px" height="40px" />
        </div>
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">My Files</h1>
          <p className="text-gray-500">View and manage your uploaded files.</p>
        </div>
        <Link to="/upload">
          <Button variant="primary">
            <FilePlus size={20} aria-hidden="true" />
            Upload File
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <form onSubmit={handleSearch} className="search-input-wrapper" style={{ maxWidth: '400px' }}>
          <Search className="search-icon" size={20} aria-hidden="true" />
          <input
            type="search"
            className="search-input"
            placeholder="Search files..."
            aria-label="Search files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="filter-tabs">
          {(['all', 'uploaded', 'failed', 'processing'] as FileFilter[]).map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Files */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={FilePlus}
          title={searchQuery ? 'No files found' : "You don't have any files yet"}
          description={
            searchQuery
              ? 'Try a different search.'
              : 'Upload your first file to get started.'
          }
          action={
            !searchQuery && (
              <Link to="/upload">
                <Button variant="primary">
                  <FilePlus size={20} aria-hidden="true" />
                  Upload File
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="card">
          <FileTable
            files={filteredFiles}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
