import React from 'react';

interface IconProps {
  n: string;
  size?: number;
  color?: string;
<<<<<<< HEAD
  style?: React.CSSProperties;
  onClick?: () => void;  // ADD THIS LINE
}

export const Icon: React.FC<IconProps> = ({ n, size = 14, color, style = {}, onClick }) => {  // ADD onClick here
  return <i 
    className={`ti ${n}`} 
    style={{ fontSize: size, color: color || "inherit", ...style }}
    onClick={onClick}  // ADD THIS LINE
  />;
};
=======
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({ n, size = 14, color, className, style = {}, onClick }) => {
  return <i 
    className={`ti ${n}${className ? ` ${className}` : ''}`} 
    style={{ fontSize: size, color: color || "inherit", ...style }}
    onClick={onClick}
  />;
};
>>>>>>> eead2da (Small Changes)
