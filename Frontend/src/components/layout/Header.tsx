import { Search, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/files?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
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
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <button className="icon-button" onClick={handleLogout} aria-label="Log out" title="Log out">
              <LogOut size={20} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            className="icon-button"
            aria-label="User menu"
            onClick={() => navigate('/login')}
            title="Sign in"
          >
            <User size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
