import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const SIDEBAR_STATE_KEY = 'workstatus-sidebar-open';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  // Initialize from localStorage, default to true if not set
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={showSidebar ? toggleSidebar : undefined} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={toggleSidebar}
            isMobile={false}
          />
        )}

        {/* Mobile Sidebar */}
        {showSidebar && (
          <Sidebar
            isOpen={mobileSidebarOpen}
            onToggle={() => setMobileSidebarOpen(false)}
            isMobile={true}
          />
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8"
        >
          <div className="container mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};
