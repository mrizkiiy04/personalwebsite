import React, { useState, useEffect } from "react";
import { GamepadIcon } from "lucide-react";
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
};

const GamesPage: React.FC = () => {
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
          .eq('category', 'game');
          
        if (countError) throw countError;
        
        const totalItems = count || 0;
        const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        setTotalPages(calculatedTotalPages);
        
        // Then fetch the actual posts with pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .eq('category', 'game')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching Game posts:', error);
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
      title="Games"
      description="Game dan berbagai jenis hiburan interaktif."
      icon={<GamepadIcon />}
      iconColor="text-purple-400"
    >
      <div className="border-4 border-black bg-zinc-800 rounded-2xl p-6 text-center">
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
                <div className="bg-purple-400 text-black border-b-4 border-black p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <span className="bg-black text-purple-400 px-2 py-1 text-xs rounded-md">
                      {post.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-black/70 font-mono">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-4">
                  <p>{post.excerpt || "No excerpt available."}</p>
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to={`/post/${post.slug}`}
                      className="bg-purple-400 text-black font-bold py-1 px-4 rounded-md border-2 border-black hover:bg-purple-500 transition-colors"
                    >
                      Baca →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-xl py-10">No Game posts found. Check back later!</p>
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

export default GamesPage; 