
import React from 'react';

type PersonaButtonProps = {
  icon: React.ReactNode;
  label: string;
  color: string;
  isActive?: boolean;
  onClick: () => void;
};

const PersonaButton: React.FC<PersonaButtonProps> = ({ 
  icon, 
  label, 
  color, 
  isActive = false, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`persona-button w-full mb-2 flex items-center justify-start gap-2 ${color} ${isActive ? 'translate-x-1' : ''}`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default PersonaButton;
