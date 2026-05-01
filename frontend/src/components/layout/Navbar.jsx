import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Projects', path: '/projects' },
    { name: 'My Tasks', path: '/tasks' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E8EAF0] px-6 md:px-10 py-3 shadow-sm">
      <div className="w-full flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          TeamSync
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-colors relative py-2 ${
                location.pathname === item.path 
                  ? "text-blue-600" 
                  : "text-slate-500 hover:text-blue-600"
              }`}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
              <span className={`inline-block mt-1 badge ${
                user?.role === 'admin' ? 'badge-admin' : 'badge-member'
              }`}>
                {user?.role}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
