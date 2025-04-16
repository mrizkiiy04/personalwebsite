import React, { createContext, useState, useContext } from 'react';

type SidebarContextType = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext; 