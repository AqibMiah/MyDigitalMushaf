import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Book, LogOut, User, Settings, Menu } from 'lucide-react';

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-bold text-lg sm:text-xl">My Digital Mushaf</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Book className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-bold text-lg sm:text-xl">My Digital Mushaf</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-1" />
                  {user.user_metadata?.username}
                </span>
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm rounded-md bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-sm px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-4`}>
          {user ? (
            <div className="flex flex-col space-y-2">
              <span className="flex items-center text-sm py-2">
                <User className="h-4 w-4 mr-1" />
                {user.user_metadata?.username}
              </span>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm rounded-md bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}