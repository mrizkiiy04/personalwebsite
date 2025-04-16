import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  content?: string;
  featured_image?: string | null;
};

const AdminPosts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      toast({
        title: "Error fetching posts",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract media paths from post content
  const extractMediaPathsFromContent = (content: string): string[] => {
    const paths: string[] = [];
    const mediaRegex = /https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/media\/content\/([^"'\s)]+)/g;
    let match;
    
    while ((match = mediaRegex.exec(content)) !== null) {
      if (match[1]) {
        paths.push(`content/${match[1]}`);
      }
    }
    
    return paths;
  };

  // Helper function to extract the path from a full Supabase URL
  const extractPathFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    console.log("Extracting path from URL:", url);
    
    // For featured images stored in the 'featured' folder
    const featuredMatch = url.match(/\/storage\/v1\/object\/public\/media\/featured\/([^?]+)/);
    if (featuredMatch && featuredMatch[1]) {
      console.log("Found featured image path:", `featured/${featuredMatch[1]}`);
      return `featured/${featuredMatch[1]}`;
    }
    
    // For content images
    const contentMatch = url.match(/\/storage\/v1\/object\/public\/media\/content\/([^?]+)/);
    if (contentMatch && contentMatch[1]) {
      console.log("Found content image path:", `content/${contentMatch[1]}`);
      return `content/${contentMatch[1]}`;
    }
    
    // Generic matcher for any media files
    const mediaMatch = url.match(/\/storage\/v1\/object\/public\/media\/([^?]+)/);
    if (mediaMatch && mediaMatch[1]) {
      console.log("Found generic media path:", mediaMatch[1]);
      return mediaMatch[1];
    }
    
    console.log("No match found for URL:", url);
    return null;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone. All associated media files will also be deleted.")) {
      return;
    }
    
    try {
      setDeleting(id);

      // First, get the complete post data to find media files
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (postError) {
        throw postError;
      }

      const mediaPathsToDelete: string[] = [];
      console.log("Post data for deletion:", postData);

      // 1. Add featured image if exists
      if (postData.featured_image) {
        console.log("Found featured image:", postData.featured_image);
        
        // Try to extract path using our helper function
        const featuredPath = extractPathFromUrl(postData.featured_image);
        
        if (featuredPath) {
          console.log("Successfully extracted featured image path:", featuredPath);
          mediaPathsToDelete.push(featuredPath);
        } else {
          // If our regex failed, try a direct approach based on URL structure
          // Example URL: https://xxxx.supabase.co/storage/v1/object/public/media/featured/filename.jpg
          const url = new URL(postData.featured_image);
          const pathParts = url.pathname.split('/');
          const mediaIndex = pathParts.findIndex(part => part === 'media');
          
          if (mediaIndex !== -1 && mediaIndex < pathParts.length - 1) {
            const extractedPath = pathParts.slice(mediaIndex + 1).join('/');
            console.log("Extracted path using URL parsing:", extractedPath);
            if (extractedPath) {
              mediaPathsToDelete.push(extractedPath);
            }
          } else {
            console.warn("Could not extract path from featured image URL:", postData.featured_image);
          }
        }
      }

      // 2. Extract media paths from content
      if (postData.content) {
        const contentPaths = extractMediaPathsFromContent(postData.content);
        console.log("Found content image paths:", contentPaths);
        mediaPathsToDelete.push(...contentPaths);
      }

      // 3. Delete media files if any were found
      if (mediaPathsToDelete.length > 0) {
        console.log("Attempting to delete media files:", mediaPathsToDelete);
        
        for (const path of mediaPathsToDelete) {
          // Log each path to be deleted
          console.log(`Deleting: ${path}`);
          
          // Try to delete files one by one to identify any specific issues
          const { error: singleDeleteError } = await supabase.storage
            .from("media")
            .remove([path]);
            
          if (singleDeleteError) {
            console.error(`Error deleting file ${path}:`, singleDeleteError);
          } else {
            console.log(`Successfully deleted: ${path}`);
          }
        }
      } else {
        console.log("No media files found to delete");
      }

      // 4. Delete the post record
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setPosts(posts.filter(post => post.id !== id));
      
      toast({
        title: "Post deleted",
        description: "Your post and associated media files have been permanently deleted.",
      });
    } catch (error) {
      console.error("Error during post deletion:", error);
      toast({
        title: "Error deleting post",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "ai":
        return "bg-purple-400 text-black hover:bg-purple-500";
      case "code":
        return "bg-cyan-400 text-black hover:bg-cyan-500";
      case "tech":
        return "bg-yellow-400 text-black hover:bg-yellow-500";
      default:
        return "bg-zinc-400 text-black hover:bg-zinc-500";
    }
  };

  return (
    <AdminLayout title="Posts Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">
          All Posts {posts.length > 0 && <span className="text-sm text-zinc-400">({posts.length} posts)</span>}
        </h2>
        <Link to="/admin/posts/new">
          <Button className="bg-cyan-400 text-black font-bold border-2 border-black hover:bg-cyan-500">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-zinc-600 rounded-lg">
          <p className="text-lg mb-3 text-zinc-400">You haven't created any posts yet.</p>
          <Link to="/admin/posts/new">
            <Button className="bg-cyan-400 text-black font-bold border-2 border-black hover:bg-cyan-500">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div 
              key={post.id}
              className="border-2 border-zinc-600 bg-zinc-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(post.category)}>
                    {post.category}
                  </Badge>
                  {post.published ? (
                    <Badge className="bg-green-500 text-black hover:bg-green-600">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-zinc-500 text-black hover:bg-zinc-600">
                      Draft
                    </Badge>
                  )}
                  <span className="text-xs text-zinc-400">
                    Last updated: {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center">
                {post.published && (
                  <Link to={`/post/${post.slug}`} target="_blank">
                    <Button size="sm" variant="outline" className="border-zinc-500">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link to={`/admin/posts/edit/${post.id}`}>
                  <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/20"
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPosts;
