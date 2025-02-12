
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">EventHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search events..."
                className="w-64 px-4 py-2 rounded-full bg-neutral/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
