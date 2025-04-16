import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

type MainLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
};

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title, 
  description,
  icon,
  iconColor = "text-white"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-white font-mono">
      {/* Sidebar is rendered once and controlled via SidebarContext */}
      <Sidebar />
      
      <div className="lg:pl-72 transition-all duration-300">
        <div className="grid grid-cols-1 gap-8 p-6 md:p-8 lg:p-10">
          {/* Main Content */}
          <div className="flex flex-col gap-10">
            {(title || description) && (
              <div className="bg-zinc-800/80 backdrop-blur-sm p-7 md:p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                {title && (
                  <div className="flex items-center gap-4 mb-4">
                    {icon && <div className={`w-10 h-10 ${iconColor}`}>{icon}</div>}
                    <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
                  </div>
                )}
                {description && (
                  <p className="text-zinc-400 text-base md:text-lg max-w-3xl">{description}</p>
                )}
              </div>
            )}

            {children}
          </div>
        </div>

        <Footer />
      </div>
      
      {/* Mobile spacing to account for fixed menu button */}
      <div className="block md:hidden h-16"></div>
    </div>
  );
};

export default MainLayout;
