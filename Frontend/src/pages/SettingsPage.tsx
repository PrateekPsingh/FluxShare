import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import type { Theme } from '../types';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const handleLogout = () => {
    showToast('info', 'Logged out successfully');
    // In a real app, this would clear session and redirect
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="card mb-6">
        <h2 className="card-title mb-4">Profile</h2>

        <div className="settings-item">
          <div className="settings-item-info">
            <div className="settings-item-label">Name</div>
            <div className="settings-item-description">Your display name</div>
          </div>
          <input
            type="text"
            className="search-input"
            defaultValue="Prateek Pratap Singh"
            style={{ maxWidth: '250px' }}
            aria-label="Name"
          />
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <div className="settings-item-label">Email</div>
            <div className="settings-item-description">Your email address</div>
          </div>
          <input
            type="email"
            className="search-input"
            defaultValue="prateek@example.com"
            style={{ maxWidth: '250px' }}
            aria-label="Email"
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card mb-6">
        <h2 className="card-title mb-4">Preferences</h2>

        <div className="settings-item">
          <div className="settings-item-info">
            <div className="settings-item-label">Theme</div>
            <div className="settings-item-description">
              Choose your preferred color scheme
            </div>
          </div>
          <div className="theme-selector">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button
                key={t}
                className={`theme-option ${theme === t ? 'active' : ''}`}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Storage Section */}
      <div className="card mb-6">
        <h2 className="card-title mb-4">Storage</h2>

        <div className="storage-progress">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Storage used</span>
            <span className="text-sm text-gray-500">1.8 GB / 10 GB</span>
          </div>
          <div className="storage-bar">
            <div className="storage-bar-fill" style={{ width: '18%' }} />
          </div>
          <p className="storage-text mt-2">
            You have 8.2 GB of storage remaining.
          </p>
        </div>
      </div>

      {/* Security Section */}
      <div className="card mb-6">
        <h2 className="card-title mb-4">Security</h2>

        <div className="settings-item">
          <div className="settings-item-info">
            <div className="settings-item-label">Session</div>
            <div className="settings-item-description">
              You're currently logged in on this device
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
