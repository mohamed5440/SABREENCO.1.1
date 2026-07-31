import React from "react";
import { optimizeImageUrl, SABREENKO_LOGO_URL } from "../../lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-full h-full object-cover",
  size = 64,
}) => {
  return (
    <img
      loading="eager"
      fetchPriority="high"
      decoding="async"
      src={optimizeImageUrl(SABREENKO_LOGO_URL, size)}
      alt="صابرينكو للخدمات السياحية"
      className={className}
      referrerPolicy="no-referrer"
      width={size}
      height={size}
    />
  );
};
