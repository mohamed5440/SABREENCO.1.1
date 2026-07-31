import React from "react";
import { Facebook, Instagram, Twitter, Globe } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface SocialLink {
  id?: string | number;
  platform: string;
  url: string;
  visible?: boolean | number;
}

interface SocialLinksProps {
  links?: SocialLink[];
  linkClassName?: string;
  iconSize?: number;
  containerClassName?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links = [],
  linkClassName = "w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 text-gray-800 shrink-0 group",
  iconSize = 18,
  containerClassName = "flex items-center gap-3",
}) => {
  const visibleLinks = (links || []).filter(
    (l) =>
      l &&
      l.url &&
      (l.visible === true || l.visible === 1 || l.visible === undefined)
  );

  if (visibleLinks.length === 0) return null;

  return (
    <div className={containerClassName}>
      {visibleLinks.map((link, idx) => {
        const key = link.id || idx;
        const label = `زيارة صفحتنا على ${link.platform}`;
        
        return (
          <a
            key={key}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={linkClassName}
          >
            {link.platform === "facebook" && (
              <Facebook
                size={iconSize}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            {link.platform === "instagram" && (
              <Instagram
                size={iconSize}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            {link.platform === "whatsapp" && (
              <WhatsAppIcon
                size={iconSize}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            {link.platform === "twitter" && (
              <Twitter
                size={iconSize}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            {!["facebook", "instagram", "whatsapp", "twitter"].includes(link.platform) && (
              <Globe
                size={iconSize}
                className="group-hover:scale-110 transition-transform"
              />
            )}
          </a>
        );
      })}
    </div>
  );
};
