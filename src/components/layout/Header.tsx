import React from 'react';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">W</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">WorkStatus</h1>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Gem Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-secondary/50">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px]">{user.name}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
