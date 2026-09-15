import React from 'react';

/**
 * Global SVG Filters for Liquid Glass Snell's Law Refraction & Specular Lighting
 * Inspired by ui-layouts liquid-glass physics engine.
 */
export const LiquidGlassFilter: React.FC = () => {
  return (
    <svg
      className="pointer-events-none absolute -top-96 -left-96 w-0 h-0 overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <defs>
        {/* Global Snell's Law Surface Refraction Filter */}
        <filter id="liquid-refraction" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.03"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
          <feBlend in="SourceGraphic" in2="blurred" mode="screen" />
        </filter>

        {/* Squircle Specular Edge Bevel Filter */}
        <filter id="liquid-specular" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4"
            specularConstant="1.6"
            specularExponent="35"
            lightingColor="#ffffff"
            result="specular"
          >
            <fePointLight x="-5000" y="-8000" z="15000" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularComposite" />
          <feBlend in="SourceGraphic" in2="specularComposite" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
};

export default LiquidGlassFilter;
