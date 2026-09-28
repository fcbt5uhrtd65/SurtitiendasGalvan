// Ilustraciones propias (SVG, fondo transparente) para el carrusel del hero.
// Antes usábamos fotos reales del catálogo, pero cada una traía su propio
// fondo/colores y no se veían limpias sobre el hero navy — esto es
// consistente sin importar qué producto se muestre.

export function MakeupIllustration() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx="34" cy="46" r="14" fill="#F4C20D" />
      <circle cx="206" cy="188" r="18" fill="#1976E8" />

      {/* polvo compacto */}
      <circle cx="86" cy="168" r="40" fill="#F5E6D3" stroke="#E5CDA3" strokeWidth="3" />
      <circle cx="86" cy="168" r="27" fill="#FBEFE0" />
      <circle cx="74" cy="155" r="6" fill="#ffffff" opacity="0.7" />

      {/* labial */}
      <rect x="138" y="120" width="28" height="66" rx="8" fill="#C9A66B" />
      <rect x="138" y="106" width="28" height="16" rx="4" fill="#B8935A" />
      <path d="M138 106 L166 106 L162 80 Q152 70 142 80 Z" fill="#E8637A" />

      {/* brocha */}
      <line x1="182" y1="66" x2="204" y2="128" stroke="#8B6F52" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="177" cy="55" rx="27" ry="21" fill="#F2A6C1" transform="rotate(-20 177 55)" />
      <ellipse cx="177" cy="55" rx="18" ry="13" fill="#F7C3D6" transform="rotate(-20 177 55)" />
    </svg>
  );
}

export function HomeIllustration() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx="30" cy="48" r="14" fill="#F4C20D" />
      <circle cx="210" cy="190" r="18" fill="#1976E8" />

      {/* lámpara de piso */}
      <line x1="185" y1="60" x2="185" y2="184" stroke="#8B6F52" strokeWidth="4" />
      <path d="M160 60 L210 60 L200 30 L170 30 Z" fill="#F5EDE3" stroke="#E5D9C8" strokeWidth="2" />
      <line x1="170" y1="184" x2="200" y2="184" stroke="#8B6F52" strokeWidth="4" strokeLinecap="round" />

      {/* planta */}
      <path d="M45 190 L75 190 L70 152 L50 152 Z" fill="#C97B4A" />
      <path d="M60 152 Q38 112 35 68" stroke="#4C8C5B" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60 152 Q76 102 92 66" stroke="#5FA36E" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60 152 Q60 102 60 62" stroke="#3F7A4D" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* sillón */}
      <rect x="88" y="130" width="92" height="56" rx="16" fill="#F0E4D4" />
      <rect x="88" y="94" width="92" height="50" rx="18" fill="#F5EDE3" />
      <rect x="75" y="110" width="17" height="66" rx="8" fill="#E9DCC8" />
      <rect x="188" y="110" width="17" height="66" rx="8" fill="#E9DCC8" />
      <rect x="94" y="176" width="12" height="20" fill="#8B6F52" />
      <rect x="164" y="176" width="12" height="20" fill="#8B6F52" />
      <rect x="103" y="106" width="40" height="40" rx="8" fill="#F4C20D" transform="rotate(-8 123 126)" />

      {/* mesa lateral */}
      <ellipse cx="206" cy="150" rx="22" ry="6" fill="#C9A66B" />
      <line x1="191" y1="153" x2="186" y2="184" stroke="#8B6F52" strokeWidth="3" />
      <line x1="221" y1="153" x2="226" y2="184" stroke="#8B6F52" strokeWidth="3" />
      <circle cx="199" cy="142" r="7" fill="#5FA36E" />
    </svg>
  );
}

export function StationeryIllustration() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx="34" cy="46" r="14" fill="#F4C20D" />
      <circle cx="206" cy="188" r="18" fill="#00B894" />

      {/* cuaderno */}
      <rect x="58" y="58" width="110" height="142" rx="10" fill="#1976E8" />
      <rect x="70" y="78" width="86" height="6" rx="3" fill="#EAF2FF" opacity="0.85" />
      <rect x="70" y="96" width="86" height="6" rx="3" fill="#EAF2FF" opacity="0.65" />
      <rect x="70" y="114" width="60" height="6" rx="3" fill="#EAF2FF" opacity="0.5" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <circle key={i} cx="58" cy={72 + i * 20} r="5" fill="#0B2D6B" />
      ))}

      {/* lápices en abanico */}
      <g transform="rotate(16 188 150)">
        <rect x="182" y="58" width="13" height="112" rx="4" fill="#F4C20D" />
        <path d="M182 58 L195 58 L188.5 38 Z" fill="#E8B23B" />
      </g>
      <g>
        <rect x="199" y="52" width="13" height="112" rx="4" fill="#E8637A" />
        <path d="M199 52 L212 52 L205.5 32 Z" fill="#D14F68" />
      </g>
      <g transform="rotate(-16 222 150)">
        <rect x="216" y="58" width="13" height="112" rx="4" fill="#00B894" />
        <path d="M216 58 L229 58 L222.5 38 Z" fill="#039370" />
      </g>
    </svg>
  );
}
