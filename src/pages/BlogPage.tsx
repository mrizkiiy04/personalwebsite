import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Calendar, Tag, ChevronLeft, ChevronRight, Sparkles, Newspaper, Coffee } from "lucide-react";
import MainLayout from "@/components/MainLayout";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  created_at: string | null;
  category: string;
  author: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get query params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const activeCategory = searchParams.get('category') || 'all';
  const postsPerPage = 5;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Create pagination range
  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  // Fetch posts and categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('category')
          .eq('published', true)
          .order('category');
        
        if (error) throw error;
        
        // Get unique categories
        const uniqueCategories = Array.from(new Set(data.map(post => post.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Compute pagination
        const from = (currentPage - 1) * postsPerPage;
        const to = from + postsPerPage - 1;
        
        // First fetch posts with pagination
        let query = supabase
          .from('posts')
          .select('id, title, slug, excerpt, featured_image, created_at, category, author_id', { count: 'exact' })
          .eq('published', true);
        
        // Add category filter if not 'all'
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }
        
        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        // Then fetch author details for the posts
        const postsWithAuthors = await Promise.all(
          data.map(async (post) => {
            // Get author profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', post.author_id)
              .single();
            
            if (profileError) {
              console.error('Error fetching author profile:', profileError);
              return {
                ...post,
                author: {
                  display_name: 'Anonymous',
                  avatar_url: null
                }
              };
            }
            
            return {
              ...post,
              author: {
                display_name: profileData?.display_name || 'Anonymous',
                avatar_url: profileData?.avatar_url || null
              }
            };
          })
        );
        
        setPosts(postsWithAuthors);
        setTotalPosts(count || 0);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchPosts();
  }, [currentPage, activeCategory]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Handle category filter
  const handleCategoryChange = (category: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category', category);
    newSearchParams.set('page', '1'); // Reset to page 1 when changing category
    setSearchParams(newSearchParams);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "ai":
        return "bg-yellow-300 text-black hover:bg-yellow-400";
      case "code":
        return "bg-purple-400 text-black hover:bg-purple-500";
      case "tech":
        return "bg-pink-400 text-black hover:bg-pink-500";
      default:
        return "bg-zinc-400 text-black hover:bg-zinc-500";
    }
  };
  
  return (
    <MainLayout>
      {/* Hero Section with animation */}
      <section className="mb-12 bg-gradient-to-r from-zinc-900 to-blue-900/30 rounded-xl border-4 border-black p-6 md:p-8 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-cyan-400 text-black w-12 h-12 rounded-full flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Newspaper className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
              Blog
            </h1>
          </div>
          <p className="text-zinc-300 text-lg max-w-2xl mb-6">
            Eksplor semua konten menarik dari jurnal digital ini, tempat berbagi inspirasi dan pengetahuan teknologi terkini.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              className={`cursor-pointer py-2 px-4 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform ${activeCategory === 'all' ? 'bg-cyan-400 text-black' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}
              onClick={() => handleCategoryChange('all')}
            >
              Semua
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                className={`cursor-pointer py-2 px-4 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform ${activeCategory === category ? getCategoryColor(category) : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-4 right-8 flex gap-3">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 border-b-2 border-zinc-700 pb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            {activeCategory === 'all' 
              ? `Semua Postingan${totalPosts > 0 ? ` (${totalPosts})` : ''}`
              : `Kategori: ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}${totalPosts > 0 ? ` (${totalPosts})` : ''}`
            }
          </h2>
        </div>
        
        {loading ? (
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-zinc-400">Memuat postingan...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Coffee className="w-10 h-10 text-zinc-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Belum Ada Postingan</h3>
              <p className="text-zinc-400 mb-8 max-w-md">
                {activeCategory !== 'all' 
                  ? `Belum ada postingan dalam kategori "${activeCategory}".` 
                  : 'Belum ada postingan yang tersedia saat ini. Silakan periksa kembali nanti.'}
              </p>
              {activeCategory !== 'all' && (
                <Button 
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-3px] transition-transform shadow-lg hover:shadow-xl"
                  onClick={() => handleCategoryChange('all')}
                >
                  Lihat Semua Postingan
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <Card key={post.id} className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-3px]">
                <div className="flex flex-col md:flex-row">
                  {post.featured_image && (
                    <div className="w-full md:w-1/3 h-56 md:h-auto border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-black bg-zinc-900">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/222/444?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className={`w-full ${post.featured_image ? 'md:w-2/3' : 'w-full'} p-6 md:p-8 relative`}>
                    {/* Add subtle gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50"></div>
                    
                    <div className="relative z-10">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400 mb-3 bg-zinc-900/40 rounded-md py-2 px-3 inline-flex">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {post.created_at 
                              ? format(new Date(post.created_at), 'MMMM d, yyyy')
                              : 'Unknown date'
                            }
                          </div>
                          
                          <span className="hidden sm:inline-block text-zinc-500 font-bold">•</span>
                          
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            <Badge 
                              className={`${getCategoryColor(post.category)} px-2 py-1 text-xs border border-black cursor-pointer`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryChange(post.category);
                              }}
                            >
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardTitle 
                          className="text-2xl font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-1 group"
                          onClick={() => navigate(`/post/${post.slug}`)}
                        >
                          <span className="border-b-2 border-transparent group-hover:border-cyan-400">{post.title}</span>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-0 my-4">
                        <CardDescription className="text-zinc-300 text-base leading-relaxed bg-zinc-900/30 p-3 rounded-md">
                          {post.excerpt || `Klik untuk membaca postingan tentang ${post.title}...`}
                        </CardDescription>
                      </CardContent>
                      
                      <CardFooter className="p-0 flex items-center justify-between mt-6">
                        <Button 
                          className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-2px] transition-transform shadow-md hover:shadow-lg"
                          onClick={() => navigate(`/post/${post.slug}`)}
                        >
                          Baca Selengkapnya
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`border-2 border-black ${currentPage === 1 ? 'opacity-50' : 'hover:bg-zinc-700 hover:translate-y-[-2px] transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {getPaginationRange().map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        className={`border-2 border-black font-bold ${
                          currentPage === page 
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                            : 'hover:bg-zinc-700 hover:translate-y-[-2px] transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`border-2 border-black ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-zinc-700 hover:translate-y-[-2px] transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BlogPage; 