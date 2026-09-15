import React from 'react';

/**
 * LiquidGlassFilter — SVG filters cho hiệu ứng liquid glass thật.
 * Render 1 lần ở App root. Các element dùng bằng style={{ filter: 'url(#liquid-glass)' }}
 *
 * Bao gồm:
 *  - #liquid-glass     : displacement + blur + specular (chuẩn ui-layouts)
 *  - #liquid-refraction: nhẹ hơn, dùng cho navbar/pill
 *  - #liquid-specular  : chỉ bevel highlight
 */
export const LiquidGlassFilter: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', zIndex: -9999, opacity: 0 }}
  >
    <defs>
      {/* ── Liquid Glass chính — displacement + specular bevel ── */}
      <filter id="liquid-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        {/* Noise layer */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="3"
          seed="5"
          result="noise"
        />
        {/* Uốn lượn nội dung phía sau */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="8"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        {/* Làm mịn nhẹ sau khi uốn */}
        <feGaussianBlur in="displaced" stdDeviation="0.6" result="blurred" />

        {/* Specular bevel — ánh sáng trên bề mặt kính */}
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="alphaBlur" />
        <feSpecularLighting
          in="alphaBlur"
          surfaceScale="5"
          specularConstant="1.0"
          specularExponent="35"
          lightingColor="white"
          result="specular"
        >
          <fePointLight x="50%" y="-60%" z="180" />
        </feSpecularLighting>
        <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularClipped" />
        <feBlend in="blurred" in2="specularClipped" mode="screen" result="final" />
        <feComposite in="final" in2="SourceGraphic" operator="over" />
      </filter>

      {/* ── Nhẹ hơn — dùng cho navbar/pill ── */}
      <filter id="liquid-refraction" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.015 0.025"
          numOctaves="2"
          seed="2"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="5"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="0.5" result="blurred" />
        <feComposite in="blurred" in2="SourceGraphic" operator="over" />
      </filter>

      {/* ── Chỉ specular highlight ── */}
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
    </defs>
  </svg>
);

export default LiquidGlassFilter;