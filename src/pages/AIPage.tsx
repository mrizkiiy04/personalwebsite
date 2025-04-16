import React, { useState, useEffect } from "react";
import { BrainCog } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  excerpt: string | null;
  featured_image: string | null;
};

const AIPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get total count first for pagination
        const { count, error: countError } = await supabase
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('published', true)
          .eq('category', 'ai');
          
        if (countError) throw countError;
        
        const totalItems = count || 0;
        const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        setTotalPages(calculatedTotalPages);
        
        // Then fetch the actual posts with pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, category, published, created_at, updated_at, excerpt, featured_image')
          .eq('published', true)
          .eq('category', 'ai')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching AI posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const hasPosts = posts.length > 0;

  return (
    <MainLayout
      title="Eksperimen AI"
      description="Eksplorasi dan percobaan dengan teknologi AI, dari LLM hingga computer vision. Tulisan di sini mencakup eksperimen, tutorial, dan refleksi tentang AI."
      icon={<BrainCog />}
      iconColor="text-yellow-300"
    >
      <div className="border-4 border-black bg-zinc-800 rounded-2xl p-6">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full bg-zinc-700" />
            <Skeleton className="h-32 w-full bg-zinc-700" />
            <Skeleton className="h-32 w-full bg-zinc-700" />
          </div>
        ) : hasPosts ? (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="border-4 border-black bg-zinc-800 text-white overflow-hidden rounded-lg">
                <div className="bg-yellow-300 text-black border-b-4 border-black p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-left">{post.title}</h3>
                    <span className="bg-black text-yellow-300 px-2 py-1 text-xs rounded-md">
                      {post.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-black/70 font-mono text-left">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  {post.featured_image && (
                    <div className="md:w-1/4">
                      <img 
                        src={post.featured_image} 
                        alt={post.title} 
                        className="w-full h-32 object-cover rounded-md border-2 border-black"
                      />
                    </div>
                  )}
                  <div className={`${post.featured_image ? 'md:w-3/4' : 'w-full'} text-left`}>
                    <p>{post.excerpt || "No excerpt available."}</p>
                    <div className="mt-4 flex justify-start">
                      <Link 
                        to={`/post/${post.slug}`}
                        className="bg-yellow-300 text-black font-bold py-1 px-4 rounded-md border-2 border-black hover:bg-yellow-400 transition-colors"
                      >
                        Baca →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-xl py-10">No AI posts found. Check back later!</p>
        )}
        
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer" 
                    />
                  </PaginationItem>
                )}
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer" 
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AIPage;
