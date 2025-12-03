import React from 'react';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">WorkStatus</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Gem Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user.name}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
