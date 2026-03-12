import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconPrograms } from './Illustrations';
import { useTheme } from '../context/ThemeContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'ADVISOR', 'MANAGEMENT'] },
  { to: '/leads', label: 'Leads', roles: ['ADMIN', 'ADVISOR', 'MANAGEMENT'] },
  { to: '/students', label: 'Students', roles: ['ADMIN', 'ADVISOR', 'MANAGEMENT'] },
  { to: '/programs', label: 'Programs', roles: ['ADMIN', 'ADVISOR', 'MANAGEMENT'] },
  { to: '/programs', label: 'My Program', studentOnly: true },
  { to: '/users', label: 'Users', roles: ['ADMIN'] }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const filteredNav = navItems.filter((item) => {
    if (!user?.role) return false;
    if (item.studentOnly) return user.role === 'STUDENT';
    return !item.roles || item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="container layout-header-inner">
          <NavLink to="/dashboard" className="logo">
            <span className="logo-icon" aria-hidden><IconPrograms /></span>
            BRD Institute
          </NavLink>
          <nav className="nav">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="user-menu">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
            <Tooltip title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleTheme}
                size="small"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                sx={{
                  ml: 0.5,
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'transparent',
                  '&:hover': { background: 'var(--btn-ghost-hover-bg)', color: 'var(--text-primary)' }
                }}
              >
                {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <button type="button" onClick={handleLogout} className="btn btn-ghost-app" style={{ marginLeft: '0.5rem', padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <div className="container page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
