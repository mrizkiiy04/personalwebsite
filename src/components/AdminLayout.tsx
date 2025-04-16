import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, FileText, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, description, icon }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  useEffect(() => {
    if (!user) {
      navigate("/admin");
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-mono">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 min-h-screen">
        {/* Admin Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-zinc-800 rounded-2xl border-4 border-black p-4 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <Button 
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-red-500/20 hover:text-red-400"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <Link to="/admin/profile">
                <Avatar className="w-20 h-20 border-4 border-black cursor-pointer">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-yellow-400 text-black text-xl">
                      {displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <p className="mt-2 font-medium text-center">
                {displayName || user.email?.split('@')[0]}
              </p>
            </div>

            <div className="space-y-2">
              <Link to="/admin/dashboard">
                <Button 
                  variant="ghost"
                  className="w-full justify-start bg-yellow-400/10 hover:bg-yellow-400/20"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/admin/posts">
                <Button 
                  variant="ghost"
                  className="w-full justify-start bg-cyan-400/10 hover:bg-cyan-400/20"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Posts
                </Button>
              </Link>
              
              <Link to="/admin/profile">
                <Button 
                  variant="ghost"
                  className="w-full justify-start bg-pink-400/10 hover:bg-pink-400/20"
                >
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-3 bg-black/30 rounded-lg border border-white/10">
              <p className="text-sm text-zinc-400">
                Logged in as <span className="text-yellow-400">{user.email}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-4">
          <div className="bg-zinc-800 rounded-2xl border-4 border-black p-6">
            <div className="mb-6 pb-4 border-b border-zinc-700">
              {icon && <div className="flex items-center gap-3 mb-2">
                <div className="text-yellow-400">{icon}</div>
                <h1 className="text-2xl font-bold">{title}</h1>
              </div>}
              {!icon && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
              {description && <p className="text-zinc-400">{description}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
