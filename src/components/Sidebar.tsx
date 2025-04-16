import React, { useEffect } from 'react';
import { Mail, Menu, X, Home, BrainCog, Code, NotebookPen, Settings, Youtube, Instagram, Twitter, Facebook, FileText, Newspaper } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

const Sidebar: React.FC = () => {
  const { mobileOpen, setMobileOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = React.useState<string | null>("https://youtube.com/@mrizkiiy");
  const [instagramUrl, setInstagramUrl] = React.useState<string | null>("https://instagram.com/mrizkiiy04");
  const [twitterUrl, setTwitterUrl] = React.useState<string | null>("https://www.threads.net/@mrizkiiy04");
  const [facebookUrl, setFacebookUrl] = React.useState<string | null>("https://facebook.com/mrizkiiy");
  
  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      
      if (mobileOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          menuButton && 
          !menuButton.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen, setMobileOpen]);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Fetch user profile data if user is logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, display_name, youtube_url, instagram_url, twitter_url, facebook_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setAvatar(data.avatar_url);
          setDisplayName(data.display_name);
          // Only override defaults if user has set their own social media links
          if (data.youtube_url) setYoutubeUrl(data.youtube_url);
          if (data.instagram_url) setInstagramUrl(data.instagram_url);
          if (data.twitter_url) setTwitterUrl(data.twitter_url);
          if (data.facebook_url) setFacebookUrl(data.facebook_url);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation links
  const navLinks = [
    { path: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/blog", icon: <Newspaper className="w-5 h-5" />, label: "Blog" },
    { path: "/ai", icon: <BrainCog className="w-5 h-5" />, label: "AI Enthusiast" },
    { path: "/code", icon: <Code className="w-5 h-5" />, label: "Code Explorer" },
    { path: "/tech", icon: <NotebookPen className="w-5 h-5" />, label: "Tech Diarist" },
    { path: "/admin", icon: <Settings className="w-5 h-5" />, label: "Admin Login" }
  ];

  const getButtonClass = (path: string) => {
    let baseClass = "w-full text-left py-2.5 px-4 rounded-lg border-2 border-black font-bold flex items-center gap-3 transition-all hover:translate-x-1 text-sm md:text-base";
    
    if (isActive(path)) {
      switch(path) {
        case "/ai":
          return `${baseClass} bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
        case "/code":
          return `${baseClass} bg-purple-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
        case "/tech":
          return `${baseClass} bg-pink-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
        case "/admin":
          return `${baseClass} bg-green-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
        case "/blog":
          return `${baseClass} bg-cyan-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
        default:
          return `${baseClass} bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;
      }
    }
    
    return `${baseClass} bg-blue-800 hover:bg-blue-700`;
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          id="menu-button"
          onClick={toggleSidebar}
          className="bg-blue-800 text-white p-2.5 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-gradient-to-b from-blue-800 to-blue-900 border-r-2 border-black 
          w-72 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          lg:shadow-[6px_0px_10px_-5px_rgba(0,0,0,0.3)]
          lg:fixed
        `}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto lg:overflow-y-hidden hover:lg:overflow-y-auto transition-all duration-300">
          <div className="mb-6 flex flex-col items-center">
            <div className="bg-zinc-900 w-28 h-28 mb-3 rounded-xl border-4 border-black flex items-center justify-center overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              {user && avatar ? (
                <Link to="/admin/profile">
                  <img 
                    src={avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-lg object-cover hover:scale-105 transition-transform"
                  />
                </Link>
              ) : (
                <img 
                  src="/default-avatar.png" 
                  alt="Default Profile" 
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
            </div>
            {user && displayName ? (
              <p className="text-white font-bold text-base text-center">{displayName}</p>
            ) : (
              <p className="text-white font-bold text-base text-center">Temukan aku di sini</p>
            )}
          </div>

          <div className="mb-6 flex flex-col items-center">
            <h3 className="text-xs uppercase tracking-wide mb-3 font-bold text-white/80">SOCIAL MEDIA</h3>
            <div className="flex space-x-3">
              {youtubeUrl && (
                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-500 text-white p-2 rounded-full border-2 border-black hover:bg-red-600 transition-all hover:scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-purple-500 text-white p-2 rounded-full border-2 border-black hover:bg-purple-600 transition-all hover:scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              
              {twitterUrl && (
                <a 
                  href={twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-white p-2 rounded-full border-2 border-black hover:bg-blue-500 transition-all hover:scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              
              {facebookUrl && (
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-2 rounded-full border-2 border-black hover:bg-blue-700 transition-all hover:scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <a 
            href={user ? `mailto:${user.email}` : "mailto:mrizkiiy@gmail.com"} 
            className="bg-green-400 text-black font-bold py-2.5 px-4 rounded-lg border-2 border-black mb-6 flex items-center justify-center gap-2 hover:bg-green-500 transition-all hover:translate-y-[-2px] text-sm md:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <Mail className="w-5 h-5" />
            <span>CONTACT ME</span>
          </a>
          
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wide mb-3 font-bold text-white/80">NAVIGATION</h3>
            <div className="space-y-2.5">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={getButtonClass(link.path)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-blue-700/50">
            <div className="flex justify-between items-center text-xs text-white/60">
              <span>Muhammad Rizki</span>
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
