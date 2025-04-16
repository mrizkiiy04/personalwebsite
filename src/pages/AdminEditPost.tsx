import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import PostEditor from "@/components/PostEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminEditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        throw error;
      }

      console.log("Fetched post data:", data);
      setPost(data);
    } catch (error) {
      toast({
        title: "Error fetching post",
        description: (error as Error).message,
        variant: "destructive",
      });
      navigate("/admin/posts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Post">
        <div className="flex justify-center p-8">
          <p>Loading post...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${post?.title}`}>
      <PostEditor postId={id} defaultValues={post} />
    </AdminLayout>
  );
};

export default AdminEditPost;
