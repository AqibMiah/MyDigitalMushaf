import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Book, LogOut, User, Settings, Menu, Bookmark, FileText } from "lucide-react"; // Added FileText for memorisation tester icon
import { Button } from "@/components/ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav className="bg-gray-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Sidebar menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Website title */}
            <Link to="/" className="ml-4">
              <span className="font-bold text-lg sm:text-xl text-gray-800">
                My Digital Mushaf
              </span>
            </Link>

            {/* Right-aligned user info */}
            <div className="flex items-center space-x-4 ml-auto">
              {user ? (
                <>
                  <span className="flex items-center text-sm text-gray-800">
                    <User className="h-4 w-4 mr-1" />
                    {user.user_metadata?.username}
                  </span>
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
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 bg-gray-100 w-64 shadow-lg`} // Sidebar width increased
      >
        <div className="h-full flex flex-col py-6 px-4">
          {/* Centered Menu Title */}
          <h2 className="text-lg font-bold text-gray-800 text-center mb-8">
            Menu
          </h2>
          <div className="space-y-4">
            <Link
              to="/bookmarks"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="flex items-center gap-4 w-full pl-4 justify-start text-left hover:bg-gray-200 hover:text-gray-900"
              >
                <Bookmark className="h-5 w-5" />
                <span className="text-gray-800">Bookmarks</span>
              </Button>
            </Link>
            <Link
              to="/memorisation-tester"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="flex items-center gap-4 w-full pl-4 justify-start text-left hover:bg-gray-200 hover:text-gray-900"
              >
                <FileText className="h-5 w-5" />
                <span className="text-gray-800">Memorisation Tester</span>
              </Button>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="flex items-center gap-4 w-full pl-4 justify-start text-left hover:bg-gray-200 hover:text-gray-900"
              >
                <Settings className="h-5 w-5" />
                <span className="text-gray-800">Settings</span>
              </Button>
            </Link>
            
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        ></div>
      )}
    </>
  );
}