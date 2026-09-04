import { Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/files?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="header-search">
        <form onSubmit={handleSearch} className="search-input-wrapper">
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
      </div>

      <div className="header-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} aria-hidden="true" />
        </button>
        <button className="icon-button" aria-label="User menu">
          <User size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
