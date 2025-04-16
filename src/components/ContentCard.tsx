
import React from 'react';
import { ArrowRight } from 'lucide-react';

type ContentCardProps = {
  value?: string | number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
};

const ContentCard: React.FC<ContentCardProps> = ({ 
  title, 
  description, 
  icon, 
  color,
  onClick 
}) => {
  return (
    <div 
      className={`${color} p-6 rounded-lg cursor-pointer h-full flex flex-col justify-between`}
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">{icon}</div>
          <ArrowRight className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
};

export default ContentCard;
