import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NotebookPen, Sparkles, Code as CodeIcon, BrainCog, ArrowRight, Calendar, Newspaper } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import InteractiveEyes from "../components/InteractiveEyes";

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

const Index: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true);
        // Fetch recent published posts
        const { data: posts, error } = await supabase
          .from('posts')
          .select('id, title, slug, category, published, created_at, updated_at, excerpt, featured_image')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        // Count total published posts
        const { count, error: countError } = await supabase
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('published', true);
          
        if (countError) throw countError;
        
        setRecentPosts(posts || []);
        setPostCount(count || 0);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

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

  const getCategoryLink = (category: string) => {
    switch (category.toLowerCase()) {
      case "ai":
        return "/ai";
      case "code":
        return "/code";
      case "tech":
        return "/tech";
      default:
        return "/";
    }
  };

  return (
    <MainLayout>
      {/* Hero Section - Improved layout with better visual hierarchy */}
      <section className="mb-12 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl border-4 border-black p-6 md:p-8 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="md:w-3/5 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 leading-tight">
              Muhammad Rizki Tech Blog
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl">
              Tempat di mana eksperimen AI, coding journey, dan refleksi teknologi bercampur dalam satu ruang digital.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/ai" className="px-5 md:px-6 py-2.5 bg-yellow-300 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-2px] transition-transform flex items-center gap-2 shadow-lg hover:shadow-xl">
                <BrainCog className="w-5 h-5" />
                <span>AI</span>
              </Link>
              <Link to="/tech" className="px-5 md:px-6 py-2.5 bg-pink-400 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-2px] transition-transform flex items-center gap-2 shadow-lg hover:shadow-xl">
                <NotebookPen className="w-5 h-5" />
                <span>Tech</span>
              </Link>
              <Link to="/code" className="px-5 md:px-6 py-2.5 bg-purple-400 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-2px] transition-transform flex items-center gap-2 shadow-lg hover:shadow-xl">
                <CodeIcon className="w-5 h-5" />
                <span>Code</span>
              </Link>
            </div>
          </div>
          <div className="md:w-2/5 flex justify-center pt-8 md:pt-0">
            <div className="w-48 h-48 md:w-72 md:h-72 bg-zinc-800 rounded-full border-4 border-black flex items-center justify-center overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent"></div>
              <InteractiveEyes />
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Dots - Enhanced animation */}
      <div className="text-center -mt-6">
        <div className="inline-flex gap-5 p-5 bg-zinc-800/80 backdrop-blur-sm rounded-full shadow-inner">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
          <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      <div className="flex flex-col gap-8 mt-8">
        {/* Recent Posts - Enhanced card design with improved spacing */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b-2 border-zinc-700 pb-4">
            <Sparkles className="w-6 h-6 text-pink-400" />
            Postingan Terbaru
          </h2>
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-7 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-36 w-full bg-zinc-700" />
                <Skeleton className="h-36 w-full bg-zinc-700" />
                <Skeleton className="h-36 w-full bg-zinc-700" />
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-8">
                {recentPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.slug}`} className="block">
                    <div className="border-2 border-zinc-700 bg-zinc-700/80 hover:bg-zinc-600/80 transition-all rounded-lg p-5 md:p-6 shadow-md hover:shadow-xl transform hover:translate-y-[-3px] group">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                        {post.featured_image ? (
                          <div className="sm:w-1/4 shrink-0">
                            <img 
                              src={post.featured_image} 
                              alt={post.title} 
                              className="w-full h-32 sm:h-40 object-cover rounded-md border-2 border-black shadow-md group-hover:shadow-lg transition-all"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/400x300/111/fff?text=No+Image";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="sm:w-1/4 shrink-0">
                            <div className="w-full h-32 sm:h-40 bg-zinc-800 rounded-md border-2 border-black flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                              <NotebookPen className="w-12 h-12 text-zinc-500" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="flex flex-wrap sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                            <h3 className="font-bold text-xl md:text-2xl line-clamp-2 group-hover:text-white transition-colors">{post.title}</h3>
                            <Badge className={`${getCategoryColor(post.category)} self-start sm:ml-2 shrink-0 px-3 py-1 text-sm`}>
                              <Link to={getCategoryLink(post.category)}>
                                {post.category}
                              </Link>
                            </Badge>
                          </div>
                          
                          {post.excerpt && (
                            <p className="text-zinc-300 text-base line-clamp-3 mb-4">{post.excerpt}</p>
                          )}
                          
                          <div className="flex items-center text-sm text-zinc-400 gap-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(post.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <span className="hidden sm:inline-block text-zinc-500 font-bold">•</span>
                            <span className="hidden sm:inline-block text-zinc-400 group-hover:text-white transition-colors">Baca</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {postCount > 3 && (
                  <div className="text-center mt-12">
                    <Link 
                      to="/blog" 
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-3px] transition-transform shadow-lg hover:shadow-xl gap-2"
                    >
                      <Newspaper className="w-5 h-5 mr-1" />
                      <span>Lihat semua {postCount} postingan</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400">
                <NotebookPen className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
                <p className="text-xl">Belum ada postingan.</p>
                <p className="text-base">Segera hadir konten menarik!</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Category Cards - Improved design with better hover effects */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b-2 border-zinc-700 pb-4">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            Kategori
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Link to="/ai" className="block h-full">
              <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-yellow-300 text-black w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-md relative z-10 group-hover:scale-110 transition-transform">
                  <BrainCog className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl mb-4 relative z-10 group-hover:text-yellow-300 transition-colors">AI Enthusiast</h3>
                <p className="text-zinc-400 text-base relative z-10 group-hover:text-zinc-300 transition-colors">Eksplorasi AI, machine learning, dan pemikiran tentang kecerdasan buatan.</p>
              </div>
            </Link>
            
            <Link to="/tech" className="block h-full">
              <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-pink-400 text-black w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-md relative z-10 group-hover:scale-110 transition-transform">
                  <NotebookPen className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl mb-4 relative z-10 group-hover:text-pink-400 transition-colors">Tech Diarist</h3>
                <p className="text-zinc-400 text-base relative z-10 group-hover:text-zinc-300 transition-colors">Catatan perjalanan, refleksi, dan pemikiran tentang perkembangan teknologi.</p>
              </div>
            </Link>
            
            <Link to="/code" className="block h-full">
              <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-purple-400 text-black w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-md relative z-10 group-hover:scale-110 transition-transform">
                  <CodeIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl mb-4 relative z-10 group-hover:text-purple-400 transition-colors">Code Explorer</h3>
                <p className="text-zinc-400 text-base relative z-10 group-hover:text-zinc-300 transition-colors">Tutorial coding, tips pengembangan, dan sharing proyek open source.</p>
              </div>
            </Link>
          </div>
        </section>
        
        {/* Stats - Improved card design with better animation */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b-2 border-zinc-700 pb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Statistik Blog
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent"></div>
              <div className="text-center relative z-10">
                <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">6</p>
                <p className="text-sm md:text-base text-zinc-400 mt-2">Years Exploring Tech</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-400/30 via-transparent to-transparent"></div>
              <div className="text-center relative z-10">
                <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">{postCount}</p>
                <p className="text-sm md:text-base text-zinc-400 mt-2">Published Posts</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-300/30 via-transparent to-transparent"></div>
              <div className="text-center relative z-10">
                <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">3</p>
                <p className="text-sm md:text-base text-zinc-400 mt-2">Categories</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 to-zinc-700 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:transform hover:translate-y-[-5px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-400/30 via-transparent to-transparent"></div>
              <div className="text-center relative z-10">
                <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">24/7</p>
                <p className="text-sm md:text-base text-zinc-400 mt-2">Learning & Building</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
