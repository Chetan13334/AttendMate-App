import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: "circle" | "rect";
  style?: React.CSSProperties;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  variant = "rect",
  style,
  className = "",
}) => {
  const finalRadius = variant === "circle" ? "50%" : borderRadius;

  const defaultStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: finalRadius,
    background: "linear-gradient(90deg, #ececec 25%, #f8f8f8 50%, #ececec 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-shimmer 1.4s linear infinite",
    ...style,
  };

  const shimmerKeyframes = `
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div className={`skeleton ${className}`} style={defaultStyle}></div>
    </>
  );
};

export default Skeleton;
