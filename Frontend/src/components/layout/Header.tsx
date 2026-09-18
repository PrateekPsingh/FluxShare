import { Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/files?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const effectiveTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

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
        <button className="icon-button" onClick={toggleTheme} title={effectiveTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
          {effectiveTheme === 'dark' ? (
            <Sun size={20} aria-hidden="true" />
          ) : (
            <Moon size={20} aria-hidden="true" />
          )}
        </button>
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <span className="header-user-email">
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
