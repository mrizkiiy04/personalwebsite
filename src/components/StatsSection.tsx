
import React from 'react';
import StatCard from './StatCard';

const StatsSection: React.FC = () => {
  return (
    <div className="border-l-4 lg:block border-neo-black p-4">
      <h3 className="text-lg font-bold mb-4 font-mono">Stats & Highlights</h3>
      
      <StatCard 
        value="6" 
        label="Years Exploring Tech" 
        color="bg-neo-yellow" 
      />
      
      <StatCard 
        value="42" 
        label="AI Experiments" 
        color="bg-neo-purple text-white" 
      />
      
      <StatCard 
        value="153" 
        label="Tech Journal Entries" 
        color="bg-neo-cyan" 
      />
      
      <StatCard 
        value="17" 
        label="Side Projects" 
        color="bg-neo-mint" 
      />
      
      <div className="neo-card bg-neo-pink text-neo-black">
        <h4 className="font-bold mb-2">Currently Learning</h4>
        <ul className="list-disc list-inside text-sm">
          <li>Generative AI Workflows</li>
          <li>RAG Techniques</li>
          <li>Multimodal LLMs</li>
        </ul>
      </div>
    </div>
  );
};

export default StatsSection;
