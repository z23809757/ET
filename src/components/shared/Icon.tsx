import React from 'react';

interface IconProps {
  n: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ n, size = 14, color, style = {} }) => {
  return <i className={`ti ${n}`} style={{ fontSize: size, color: color || "inherit", ...style }} />;
};