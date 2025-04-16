
import React from 'react';

type StatCardProps = {
  value: string | number;
  label: string;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => {
  return (
    <div className={`neo-card ${color} mb-4`}>
      <div className="text-2xl font-bold mb-1 font-mono">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

export default StatCard;
