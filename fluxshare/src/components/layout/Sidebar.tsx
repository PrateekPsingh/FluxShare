import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Settings, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/files', label: 'Files', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Upload size={18} aria-hidden="true" />
          </div>
          <span className="sidebar-logo-text">FluxShare</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                aria-label={label}
              >
                <Icon className="nav-item-icon" size={20} aria-hidden="true" />
                <span className="nav-item-text">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" style={{ width: '100%' }} aria-label="Log out">
          <LogOut className="nav-item-icon" size={20} aria-hidden="true" />
          <span className="nav-item-text">Log out</span>
        </button>
      </div>
    </aside>
  );
}
