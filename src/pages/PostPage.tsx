import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Share2, BookOpen, Clock, Eye, ChevronLeft, Sparkles, Link as LinkIcon } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import 'highlight.js/styles/vs2015.css';
import hljs from 'highlight.js';
import { toast } from "sonner";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  content: string;
  created_at: string;
  updated_at: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
};

type ProfileData = {
  avatar_url: string | null;
  display_name: string | null;
};

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [authorProfile, setAuthorProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        if (!slug) {
          throw new Error("Post slug is required");
        }

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Post not found");

        // Fix for TypeScript error - use type assertion
        setPost(data as unknown as Post);

        // Calculate reading time
        const wordCount = data.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

        setReadingTime(readTime);

        // Fetch author profile
        if (data.author_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url, display_name')
            .eq('id', data.author_id)
            .single();

          if (!profileError && profileData) {
            setAuthorProfile(profileData);
          }
        }
        
        // Apply syntax highlighting after a short delay
        setTimeout(() => {
          if (contentRef.current) {
            const codeBlocks = contentRef.current.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
              hljs.highlightElement(block as HTMLElement);
            });
          }
        }, 100);
        
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error instanceof Error ? error.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    // Add custom styles for the post content
    const style = document.createElement('style');
    style.innerHTML = `
      .post-content h1 {
        font-size: 2rem;
        font-weight: bold;
        margin-top: 2rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #3f3f46;
        color: white;
      }

      .post-content h2 {
        font-size: 1.5rem;
        font-weight: bold;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid #3f3f46;
        color: white;
      }
      
      .post-content h3 {
        font-size: 1.25rem;
        font-weight: bold;
        margin-top: 1.25rem;
        margin-bottom: 0.75rem;
        color: white;
      }
      
      .post-content p {
        margin-bottom: 1.25rem;
        line-height: 1.8;
      }

      .post-content strong, .post-content b {
        font-weight: bold;
        color: white;
      }

      .post-content em, .post-content i {
        font-style: italic;
      }

      .post-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.75rem;
        margin: 1.5rem 0;
        border: 4px solid black;
        box-shadow: 6px 6px 0 0 rgba(0,0,0,1);
        aspect-ratio: 16/9;
        object-fit: cover;
      }

      .post-content a {
        color: #22d3ee;
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 2px;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .post-content a:hover {
        color: #06b6d4;
        text-decoration-thickness: 3px;
      }

      .post-content ul, .post-content ol {
        padding-left: 1.75rem;
        margin-bottom: 1.5rem;
        line-height: 1.7;
      }

      .post-content ul {
        list-style-type: disc;
      }

      .post-content ol {
        list-style-type: decimal;
      }
      
      .post-content li {
        margin-bottom: 0.5rem;
      }

      .post-content blockquote {
        border-left: 4px solid #0ea5e9;
        padding: 1rem 1.5rem;
        margin: 1.5rem 0;
        background-color: rgba(14, 165, 233, 0.1);
        border-radius: 0.5rem;
        font-style: italic;
      }
      
      .post-content blockquote p {
        margin-bottom: 0;
      }

      .post-content pre {
        background-color: #1a1a1a;
        color: #e5e5e5;
        font-family: 'JetBrains Mono', monospace, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        padding: 1.25rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.9rem;
        line-height: 1.5;
        border: 2px solid #000;
        box-shadow: 4px 4px 0 0 rgba(0,0,0,1);
      }

      .post-content code {
        background-color: rgba(30, 30, 30, 0.8);
        color: #e5e5e5;
        font-family: 'JetBrains Mono', monospace, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.9rem;
      }

      .post-content pre code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }

      .post-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        border: 2px solid #3f3f46;
        border-radius: 0.5rem;
        overflow: hidden;
      }
      
      .post-content th, .post-content td {
        padding: 0.75rem 1rem;
        border: 1px solid #3f3f46;
      }
      
      .post-content th {
        background-color: #27272a;
        font-weight: bold;
        text-align: left;
      }
      
      .post-content tr:nth-child(even) {
        background-color: #1f1f23;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Get category color
  const getCategoryColor = (category?: string) => {
    if (!category) return { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-600' };
    
    switch (category.toLowerCase()) {
      case 'ai':
        return { 
          bg: 'bg-yellow-300', 
          text: 'text-black', 
          border: 'border-black',
          hover: 'hover:bg-yellow-400'
        };
      case 'code':
        return { 
          bg: 'bg-purple-400', 
          text: 'text-black', 
          border: 'border-black',
          hover: 'hover:bg-purple-500'
        };
      case 'tech':
        return { 
          bg: 'bg-pink-400', 
          text: 'text-black', 
          border: 'border-black',
          hover: 'hover:bg-pink-500'
        };
      default:
        return { 
          bg: 'bg-cyan-400', 
          text: 'text-black', 
          border: 'border-black',
          hover: 'hover:bg-cyan-500'
        };
    }
  };

  const categoryColor = getCategoryColor(post?.category);

  const handleShareClick = async () => {
    try {
      setSharing(true);
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: post?.title || 'Share this post',
          text: post?.excerpt || 'Check out this interesting post',
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // If error is AbortError, it means user canceled the share dialog
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Share canceled');
      } else {
        // Try to copy to clipboard as fallback
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        } catch (clipboardError) {
          toast.error('Could not share. Try copying the URL from the address bar.');
        }
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Back button */}
        <Button
          onClick={() => navigate('/blog')}
          className="mb-6 text-white bg-zinc-800 hover:bg-zinc-700 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all pl-2 pr-4 py-2 h-10"
          size="sm"
        >
          <ChevronLeft size={18} className="mr-1" /> Back to Blog
        </Button>

        {loading ? (
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-zinc-400">Memuat artikel...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-red-500 rounded-xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-red-500">Error Loading Post</h3>
              <p className="text-zinc-300 mb-8 max-w-md">{error}</p>
              <Button 
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-3px] transition-transform shadow-lg hover:shadow-xl"
                onClick={() => navigate('/blog')}
              >
                Return to Blog
              </Button>
            </div>
          </div>
        ) : post ? (
          <div className="max-w-4xl mx-auto">
            {/* Post header - Hero section with background */}
            <div className="mb-10 bg-gradient-to-r from-zinc-900 to-blue-900/30 rounded-xl border-4 border-black p-6 md:p-8 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
              
              <div className="relative z-10">
                {/* Category badge */}
                <div className="mb-4">
                  <Badge 
                    className={`${categoryColor.bg} ${categoryColor.text} px-3 py-1.5 text-sm font-bold border-2 ${categoryColor.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                    onClick={() => navigate(`/blog?category=${post.category}`)}
                  >
                    {post.category}
                  </Badge>
                </div>
                
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-200">{post.title}</h1>
                
                {/* Excerpt / Subtitle */}
                {post.excerpt && (
                  <p className="text-lg text-zinc-300 mb-6 border-l-4 border-cyan-400 pl-4 py-2 bg-zinc-800/50 rounded-r-md">{post.excerpt}</p>
                )}
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400 mt-6 bg-zinc-900/40 rounded-md py-3 px-4 inline-flex">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  <span className="hidden sm:inline-block text-zinc-600">•</span>
                  
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <div className="flex items-center">
                      {authorProfile?.avatar_url && (
                        <div className="w-5 h-5 rounded-full mr-1.5 overflow-hidden border border-zinc-600">
                          <img
                            src={authorProfile.avatar_url}
                            alt="Author"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/32x32/111/fff?text=A";
                            }}
                          />
                        </div>
                      )}
                      <span>{authorProfile?.display_name || "Anonymous"}</span>
                    </div>
                  </div>
                  
                  <span className="hidden sm:inline-block text-zinc-600">•</span>
                  
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-4 right-8 flex gap-3">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            
            {/* Featured Image moved outside */}
            
            {/* Article content */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 border-b-2 border-zinc-700 pb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Artikel
                </h2>
                
                <Button
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border-2 border-black hover:translate-y-[-2px] transition-transform shadow-md hover:shadow-lg flex items-center gap-1.5"
                  onClick={handleShareClick}
                  disabled={sharing}
                >
                  <Share2 size={14} className={sharing ? 'animate-pulse' : ''} />
                  {sharing ? 'Sharing...' : 'Share'}
                </Button>
              </div>
              
              <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Featured Image now inside the article card */}
                {post.featured_image && (
                  <div className="w-full overflow-hidden aspect-video relative border-b-4 border-black">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/1280x720/111/fff?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  <div
                    ref={contentRef}
                    className="post-content text-base md:text-lg leading-relaxed text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </div>
            </div>
            
            {/* Post footer */}
            <div className="mt-12 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xl border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-zinc-300 font-medium">Terima kasih telah membaca!</p>
                  <p className="text-zinc-500 text-sm">Bagikan artikel ini ke teman Anda</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-bold border-2 border-black hover:translate-y-[-2px] transition-transform shadow-md hover:shadow-lg flex items-center gap-1.5"
                  onClick={handleShareClick}
                  disabled={sharing}
                >
                  <Share2 size={16} />
                  Share
                </Button>
                
                <Button
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold border-2 border-black hover:translate-y-[-2px] transition-transform shadow-md hover:shadow-lg flex items-center gap-1.5"
                  onClick={() => navigate('/blog')}
                >
                  <ChevronLeft size={16} />
                  Blog
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-800/70 backdrop-blur-sm border-4 border-yellow-500 rounded-xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 text-black">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-yellow-500">Post Not Found</h3>
              <p className="text-zinc-300 mb-8 max-w-md">The post you're looking for doesn't exist or has been removed.</p>
              <Button 
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full font-bold border-2 border-black hover:translate-y-[-3px] transition-transform shadow-lg hover:shadow-xl"
                onClick={() => navigate('/blog')}
              >
                Return to Blog
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PostPage; 