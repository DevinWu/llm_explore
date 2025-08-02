import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, CreditCard, History, Languages } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              易上架
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <User size={16} />
                <span>仪表板</span>
              </Link>
              <Link
                to="/translate"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/translate') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Languages size={16} />
                <span>翻译</span>
              </Link>
              <Link
                to="/history"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/history') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <History size={16} />
                <span>历史</span>
              </Link>
              <Link
                to="/topup"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/topup') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <CreditCard size={16} />
                <span>充值</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">余额: ¥{user.balance.toFixed(2)}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 rounded-md"
            >
              <LogOut size={16} />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
