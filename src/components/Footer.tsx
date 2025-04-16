import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 pb-10 text-center">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center text-zinc-400 text-sm">
            <span>© {new Date().getFullYear()} muhammad rizki —</span>
            <div className="flex items-center mx-2">
              <span className="mr-1">made with</span>
              <Heart className="h-3 w-3 text-pink-400 animate-pulse" />
            </div>
            <span>All chaos reserved.</span>
          </div>
          
          <div className="flex gap-3">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></span>
          </div>
          
          <div className="mt-3 text-xs text-zinc-500">
            Built with React, Supabase, and Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
