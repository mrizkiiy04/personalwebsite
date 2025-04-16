import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import AIPage from "./pages/AIPage";
import CodePage from "./pages/CodePage";
import TechPage from "./pages/TechPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminPosts from "./pages/AdminPosts";
import AdminNewPost from "./pages/AdminNewPost";
import AdminEditPost from "./pages/AdminEditPost";
import GamesPage from './pages/GamesPage';
import MusicPage from './pages/MusicPage';
import PostPage from './pages/PostPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/code" element={<CodePage />} />
              <Route path="/tech" element={<TechPage />} />
              <Route path="/game" element={<GamesPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/post/:slug" element={<PostPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
              <Route path="/admin/posts/new" element={<AdminNewPost />} />
              <Route path="/admin/posts/edit/:id" element={<AdminEditPost />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
