import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Book, LogOut, User, Settings, Menu, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn's Button component

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
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-gray-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
              <span className="font-bold text-lg sm:text-xl text-gray-800">
                My Digital Mushaf
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Book className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            <span className="font-bold text-lg sm:text-xl text-gray-800">
              My Digital Mushaf
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="flex items-center text-sm text-gray-800">
                  <User className="h-4 w-4 mr-1" />
                  {user.user_metadata?.username}
                </span>
                <Link to="/bookmarks">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} pb-4`}>
          {user ? (
            <div className="space-y-2">
              <span className="flex items-center text-sm text-gray-800">
                <User className="h-4 w-4 mr-1" />
                {user.user_metadata?.username}
              </span>
              <Link to="/bookmarks" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Bookmarks
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="default"
                className="w-full justify-start flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}