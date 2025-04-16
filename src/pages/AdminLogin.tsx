import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pointsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number }>>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  // Canvas and animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPoints();
    };

    // Generate points
    const initPoints = () => {
      const numPoints = Math.floor(window.innerWidth * window.innerHeight / 15000);
      pointsRef.current = Array.from({ length: numPoints }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7
      }));
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        setMousePosition({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
    };

    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw points and connections
      const points = pointsRef.current;
      const mouseX = mousePosition.x;
      const mouseY = mousePosition.y;
      
      // Update point positions
      points.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;
        
        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx = -point.vx;
        if (point.y < 0 || point.y > canvas.height) point.vy = -point.vy;
        
        // Keep points within canvas
        point.x = Math.max(0, Math.min(canvas.width, point.x));
        point.y = Math.max(0, Math.min(canvas.height, point.y));
      });
      
      // Draw mouse connections
      if (mouseX && mouseY) {
        points.forEach(point => {
          const dist = Math.hypot(mouseX - point.x, mouseY - point.y);
          const maxDist = 200;
          
          if (dist < maxDist) {
            // Draw line to mouse
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(mouseX, mouseY);
            const opacity = 0.5 * (1 - dist / maxDist);
            ctx.strokeStyle = `rgba(234, 179, 8, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Subtle attraction to cursor
            const force = 0.1 * (1 - dist / maxDist);
            point.vx += (mouseX - point.x) * force / dist;
            point.vy += (mouseY - point.y) * force / dist;
            
            // Limit velocity
            const speed = Math.hypot(point.vx, point.vy);
            if (speed > 1.5) {
              point.vx = (point.vx / speed) * 1.5;
              point.vy = (point.vy / speed) * 1.5;
            }
          }
        });
      }
      
      // Draw connections between points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          const maxDist = 120;
          
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            const opacity = 0.2 * (1 - dist / maxDist);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    resizeCanvas();
    
    // Set initial mouse position to center of screen
    setMousePosition({
      x: canvas.width / 2,
      y: canvas.height / 2
    });
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "Welcome to admin dashboard",
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-mono flex items-center justify-center p-4 relative overflow-hidden">
      {/* Interactive canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.7 }}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-zinc-800 to-blue-500/20 animate-gradient-slow"></div>
        
        {/* Floating particles */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index}
              className={`particle particle-${index % 5 + 1}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 7}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Floating lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse-slower"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent animate-pulse-slow"></div>
      </div>
      
      {/* Login Card */}
      <Card className="w-full max-w-md border-4 border-black bg-zinc-800/90 text-white backdrop-blur-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <CardHeader className="bg-yellow-400 text-black border-b-4 border-black">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-black/70">
            Enter your credentials to access admin features
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block font-bold">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-black bg-zinc-700 pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block font-bold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-black bg-zinc-700 pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-black font-bold border-2 border-black hover:bg-yellow-500 transition-all hover:translate-y-[-2px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              {isSubmitting ? "Logging in..." : "Login"}
              <Lock className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* CSS for animations */}
      <style>
        {`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-35px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.5;
          animation: float infinite linear;
        }
        
        .particle-1 {
          width: 15px;
          height: 15px;
          background-color: rgba(234, 179, 8, 0.3);
        }
        
        .particle-2 {
          width: 20px;
          height: 20px;
          background-color: rgba(59, 130, 246, 0.3);
        }
        
        .particle-3 {
          width: 25px;
          height: 25px;
          background-color: rgba(236, 72, 153, 0.3);
        }
        
        .particle-4 {
          width: 10px;
          height: 10px;
          background-color: rgba(168, 85, 247, 0.3);
        }
        
        .particle-5 {
          width: 18px;
          height: 18px;
          background-color: rgba(34, 211, 238, 0.3);
        }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;
