import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", style = {} }) => {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: '#ebebeb',
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        borderRadius: '0.375rem',
        ...style
      }}
    />
  );
};

export { Skeleton };