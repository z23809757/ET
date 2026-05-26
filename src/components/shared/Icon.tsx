import React from 'react';

interface IconProps {
  n: string;
  size?: number;
  color?: string;
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

export default Icon;