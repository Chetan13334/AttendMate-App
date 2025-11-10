import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius = "4px", 
  style, 
  className = "" 
}) => {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "#f0f0f0",
    borderRadius,
    animation: "pulse 1.5s ease-in-out infinite",
    width: width || "100%",
    height: height || "16px",
    ...style
  };

  const styleWithKeyframes = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;

  return (
    <>
      <style>{styleWithKeyframes}</style>
      <div 
        className={`skeleton-loader ${className}`} 
        style={defaultStyle}
      />
    </>
  );
};

export default Skeleton;