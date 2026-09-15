import React from 'react';

/**
 * iOS 26-style SVG filter for true liquid glass refraction.
 * Uses displacement mapping + specular lighting for authentic glass look.
 * Must be rendered once in the DOM (App root level).
 */
export const LiquidGlassFilter: React.FC = () => {
  return (
    <svg
      className="pointer-events-none absolute w-0 h-0 overflow-hidden"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'fixed', zIndex: -9999, opacity: 0 }}
    >
      <defs>
        {/* Primary liquid refraction — used on bars/cards */}
        <filter id="liquid-refraction" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.025"
            numOctaves="3"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
          <feComposite in="blurred" in2="SourceGraphic" operator="over" />
        </filter>

        {/* Specular bevel lighting — top-edge highlight */}
        <filter id="liquid-specular" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="6"
            specularConstant="1.2"
            specularExponent="40"
            lightingColor="white"
            result="specular"
          >
            <fePointLight x="50%" y="-50%" z="200" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceAlpha" operator="in" result="clipped" />
          <feBlend in="SourceGraphic" in2="clipped" mode="screen" />
        </filter>

        {/* Frosted glass — heavier blur for modals */}
        <filter id="frosted-glass" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" type="saturate" values="1.5" />
        </filter>
      </defs>
    </svg>
  );
};

export default LiquidGlassFilter;
