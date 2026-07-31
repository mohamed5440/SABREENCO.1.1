import React from "react";
import { ArrowRight } from "lucide-react";
import { HighlightCurve } from "../ui";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ServicePageLayoutProps {
  id: string;
  badge?: string;
  title: string;
  highlight: string;
  description: string;
  features: Feature[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  onCtaClick: () => void;
  children?: React.ReactNode;
}

export const ServicePageLayout: React.FC<ServicePageLayoutProps> = ({
  id,
  title,
  highlight,
  description,
  features,
  ctaTitle,
  ctaDescription,
  ctaButtonText,
  onCtaClick,
  children,
}) => {
  return (
    <section
      id={id}
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="section-header-unified">
        <h1 className="heading-unified">
          {title}{" "}
          <HighlightCurve>{highlight}</HighlightCurve>
        </h1>
        <p className="description-unified">{description}</p>
      </div>

      {children}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8 md:mb-12">
        {features.map((feature, idx) => (
          <div key={idx} className="card-unified group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-all shrink-0 border border-primary/20">
              {feature.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4">
              {feature.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-right w-full md:w-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            {ctaTitle}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium max-w-xl leading-[1.7]">
            {ctaDescription}
          </p>
        </div>
        <button
          onClick={onCtaClick}
          className="w-full md:w-auto btn-primary-unified shrink-0"
        >
          {ctaButtonText}
          <ArrowRight size={18} className="rotate-180" />
        </button>
      </div>
    </section>
  );
};
