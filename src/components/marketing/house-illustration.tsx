// Flat-colour illustration of a California bungalow — the archetypal Melbourne
// suburban home. Filled vector artwork (not line art), drawn from the site
// palette so it sits naturally in the hero.
export function HouseIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 400" className={className} aria-hidden="true">
      {/* sky */}
      <rect width="560" height="400" fill="#EBE6D9" />
      {/* sun */}
      <circle cx="468" cy="78" r="42" fill="#B08A4E" opacity="0.85" />
      {/* distant hedge line */}
      <rect y="268" width="560" height="10" fill="#1F4A3C" opacity="0.25" />
      {/* lawn */}
      <rect y="276" width="560" height="124" fill="#3D6B54" opacity="0.5" />

      {/* main gable roof */}
      <path d="M 60 208 L 250 96 L 440 208 Z" fill="#1F4A3C" />
      {/* eaves shadow */}
      <path d="M 60 208 L 250 96 L 440 208 L 424 208 L 250 106 L 76 208 Z" fill="#16201B" opacity="0.35" />
      {/* chimney */}
      <rect x="330" y="112" width="26" height="58" fill="#B08A4E" />
      <rect x="326" y="106" width="34" height="10" fill="#16201B" opacity="0.7" />

      {/* house body */}
      <rect x="84" y="208" width="332" height="120" fill="#F9F6EE" />
      {/* weatherboard lines */}
      {[224, 240, 256, 272, 288, 304].map((y) => (
        <rect key={y} x="84" y={y} width="332" height="2" fill="#16201B" opacity="0.07" />
      ))}

      {/* porch gable */}
      <path d="M 258 208 L 330 164 L 402 208 Z" fill="#2A5A47" />
      {/* porch posts */}
      <rect x="272" y="208" width="12" height="96" fill="#B08A4E" />
      <rect x="376" y="208" width="12" height="96" fill="#B08A4E" />
      {/* porch base */}
      <rect x="258" y="304" width="144" height="10" fill="#B08A4E" opacity="0.8" />

      {/* door */}
      <rect x="310" y="230" width="40" height="74" rx="2" fill="#1F4A3C" />
      <circle cx="342" cy="270" r="3" fill="#B08A4E" />
      {/* transom window above door */}
      <rect x="310" y="220" width="40" height="7" fill="#16201B" opacity="0.25" />

      {/* bay window (left) */}
      <rect x="116" y="228" width="104" height="76" fill="#FFFFFF" opacity="0.6" />
      <rect x="116" y="228" width="104" height="76" fill="none" stroke="#1F4A3C" strokeWidth="5" />
      <line x1="168" y1="228" x2="168" y2="304" stroke="#1F4A3C" strokeWidth="4" />
      <line x1="116" y1="262" x2="220" y2="262" stroke="#1F4A3C" strokeWidth="4" />
      {/* window box */}
      <rect x="110" y="304" width="116" height="9" fill="#2A5A47" />

      {/* steps */}
      <rect x="300" y="314" width="60" height="7" fill="#16201B" opacity="0.35" />
      <rect x="294" y="321" width="72" height="7" fill="#16201B" opacity="0.25" />

      {/* path */}
      <path d="M 316 328 L 344 328 L 372 400 L 288 400 Z" fill="#F9F6EE" opacity="0.7" />

      {/* picket fence, left run */}
      {[24, 40, 56, 72].map((x) => (
        <rect key={x} x={x} y="296" width="8" height="38" rx="2" fill="#F9F6EE" />
      ))}
      <rect x="18" y="304" width="70" height="6" fill="#F9F6EE" />

      {/* tree */}
      <rect x="486" y="238" width="12" height="88" fill="#5B4632" />
      <circle cx="492" cy="212" r="46" fill="#2A5A47" />
      <circle cx="462" cy="234" r="30" fill="#3D6B54" />
      <circle cx="522" cy="238" r="26" fill="#1F4A3C" />

      {/* shrubs by porch */}
      <circle cx="252" cy="318" r="18" fill="#2A5A47" />
      <circle cx="416" cy="320" r="16" fill="#3D6B54" />
    </svg>
  );
}
