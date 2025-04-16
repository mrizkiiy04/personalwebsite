
import { User } from "lucide-react";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
};

const Avatar = ({ src, alt = "Avatar", size = "md" }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div 
      className={`${sizeClasses[size]} relative overflow-hidden border-4 border-neo-black rounded-full bg-neo-yellow flex items-center justify-center`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-2/3 h-2/3 text-neo-black" />
      )}
    </div>
  );
};

export default Avatar;
