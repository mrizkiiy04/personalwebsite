import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Save, User, Mail, Youtube, Instagram, Twitter, Facebook } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Label } from "@/components/ui/label";

type ProfileData = {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
};

const AdminProfile: React.FC = () => {
  const { user, updateEmail } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Social media URLs
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
        // Set social media URLs
        setYoutubeUrl(data.youtube_url || "");
        setInstagramUrl(data.instagram_url || "");
        setTwitterUrl(data.twitter_url || "");
        setFacebookUrl(data.facebook_url || "");
      }
    } catch (error) {
      toast({
        title: "Error fetching profile",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${uuidv4()}.${fileExt}`;

      // Check if the avatars bucket exists, create it if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucketExists) {
        // Create the avatars bucket
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        
        if (createBucketError) {
          console.warn("Error creating bucket:", createBucketError);
          // Continue anyway, the bucket might already exist
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (urlData) {
        setAvatarUrl(urlData.publicUrl);
        updateProfileData({ avatar_url: urlData.publicUrl });
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error uploading avatar",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfileData = async (updates: Partial<ProfileData>) => {
    try {
      console.log("Attempting to update profile with:", updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateProfileData({ display_name: displayName });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateEmail(email);
      
      // Additional success message with more detailed instructions
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and click the verification link to complete your email change.",
        variant: "default",
      });
    } catch (error) {
      // Show the error in this component as well for better visibility
      toast({
        title: "Error updating email",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateSocialMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log("Social media form data:", {
        youtube_url: youtubeUrl || null,
        instagram_url: instagramUrl || null,
        twitter_url: twitterUrl || null,
        facebook_url: facebookUrl || null
      });
      
      await updateProfileData({ 
        youtube_url: youtubeUrl || null,
        instagram_url: instagramUrl || null,
        twitter_url: twitterUrl || null,
        facebook_url: facebookUrl || null
      });
      
      toast({
        title: "Social media updated",
        description: "Your social media links have been updated successfully.",
      });
    } catch (error) {
      console.error("Social media update error:", error);
      toast({
        title: "Error updating social media",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Profile Settings">
        <div className="flex justify-center p-8">
          <p>Loading profile...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Profile & Settings">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-zinc-800 border-2 border-black">
          <TabsTrigger value="profile" className="data-[state=active]:bg-pink-400 data-[state=active]:text-black">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
            <Instagram className="mr-2 h-4 w-4" />
            Social Media
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <div className="p-6 border-2 border-zinc-600 rounded-lg bg-zinc-700">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" /> Profile Information
            </h2>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="w-32 h-32 border-4 border-black">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-yellow-400 text-black text-3xl">
                      {displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-black border-2 border-zinc-600 rounded-full p-1">
                  <Upload className="h-4 w-4" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadAvatar}
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 text-center mb-4">
              Upload a square 1:1 profile image (max 2MB)
            </p>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="displayName" className="block font-bold">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-2 border-black bg-zinc-600"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={saving || uploadingAvatar}
                className="w-full bg-pink-400 text-black font-bold border-2 border-black hover:bg-pink-500"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <div className="p-6 border-2 border-zinc-600 rounded-lg bg-zinc-700">
            <h2 className="text-xl font-bold mb-4">Email Settings</h2>
            
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block font-bold">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-black bg-zinc-600"
                />
              </div>
              
              <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded-md text-sm">
                <p>Changing your email will require verification of the new address. You must click the confirmation link sent to your new email before the change takes effect.</p>
              </div>
              
              <Button 
                type="submit" 
                disabled={saving || email === (user?.email || "")}
                className="w-full bg-yellow-400 text-black font-bold border-2 border-black hover:bg-yellow-500"
              >
                {saving ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-4">
          <div className="p-6 border-2 border-zinc-600 rounded-lg bg-zinc-700">
            <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
            
            <form onSubmit={handleUpdateSocialMedia} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <div className="flex">
                  <div className="bg-zinc-700 flex items-center px-3 rounded-l-md border-y-2 border-l-2 border-black">
                    <Youtube className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    id="youtube" 
                    type="url" 
                    value={youtubeUrl} 
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="rounded-l-none border-2 border-black bg-zinc-600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <div className="flex">
                  <div className="bg-zinc-700 flex items-center px-3 rounded-l-md border-y-2 border-l-2 border-black">
                    <Instagram className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    id="instagram" 
                    type="url" 
                    value={instagramUrl} 
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                    className="rounded-l-none border-2 border-black bg-zinc-600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <div className="flex">
                  <div className="bg-zinc-700 flex items-center px-3 rounded-l-md border-y-2 border-l-2 border-black">
                    <Twitter className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    id="twitter" 
                    type="url" 
                    value={twitterUrl} 
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                    className="rounded-l-none border-2 border-black bg-zinc-600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <div className="flex">
                  <div className="bg-zinc-700 flex items-center px-3 rounded-l-md border-y-2 border-l-2 border-black">
                    <Facebook className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    id="facebook" 
                    type="url" 
                    value={facebookUrl} 
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourusername"
                    className="rounded-l-none border-2 border-black bg-zinc-600"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-400 text-black font-bold border-2 border-black hover:bg-green-500"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Social Media Links"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminProfile;
