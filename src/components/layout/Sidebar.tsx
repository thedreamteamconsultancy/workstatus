import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  Users, 
  Settings, 
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    description: 'Overview & team management',
  },
  {
    id: 'clients',
    label: 'Clients & Finance',
    icon: Building2,
    path: '/admin/clients',
    description: 'Manage clients & revenue',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Mobile overlay sidebar
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onToggle}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={onToggle}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                            active
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", active && "text-primary-foreground")} />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className={cn(
                                "text-xs",
                                active ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">WorkStatus v1.0</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 72 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="hidden md:flex flex-col bg-card border-r border-border flex-shrink-0 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-end p-3 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="hover:bg-muted"
          >
            <ChevronLeft className={cn(
              "w-5 h-5 transition-transform duration-300",
              !isOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    !isOpen && "justify-center"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary-foreground")} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 overflow-hidden"
                      >
                        <div className="font-medium whitespace-nowrap">{item.label}</div>
                        {item.description && (
                          <div className={cn(
                            "text-xs whitespace-nowrap",
                            active ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {item.description}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-t border-border"
            >
              <p className="text-xs text-muted-foreground text-center">WorkStatus v1.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

// Sidebar toggle button for mobile (to be placed in header)
export const SidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden">
      <Menu className="w-5 h-5" />
    </Button>
  );
};
