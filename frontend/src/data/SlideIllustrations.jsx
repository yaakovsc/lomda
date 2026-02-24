import React from 'react';

// Thematic SVG illustrations for each training slide (indexed by slide id)
const illustrations = {

  // 1: Welcome – Shield with lock
  1: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="74" r="52" fill={`${color}08`} />
      <path d="M180 16L244 44L244 96Q244 140 180 158Q116 140 116 96L116 44Z" fill={`${color}18`} stroke={color} strokeWidth="2.5" />
      <rect x="162" y="84" width="36" height="30" rx="6" fill={color} />
      <path d="M169 84Q169 68 180 68Q191 68 191 84" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="180" cy="97" r="5" fill="white" />
      <rect x="178" y="97" width="4" height="10" rx="2" fill="white" />
      <circle cx="62" cy="36" r="6" fill="#f1c40f" />
      <circle cx="58" cy="34" r="3" fill="#f39c12" opacity="0.6" />
      <circle cx="288" cy="52" r="8" fill="#27ae60" opacity="0.5" />
      <circle cx="308" cy="30" r="5" fill={color} opacity="0.3" />
      <circle cx="42" cy="88" r="4" fill={color} opacity="0.2" />
      <path d="M272 110 Q290 95 300 110 Q290 125 272 110Z" fill="#e74c3c" opacity="0.25" />
    </svg>
  ),

  // 2: Why security matters – Building with breach
  2: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="48" width="90" height="95" rx="4" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <rect x="65" y="28" width="50" height="24" rx="3" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
      {[58, 80, 102].map(x => [60, 82, 104].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="15" height="13" rx="2.5" fill={color} opacity="0.38" />
      )))}
      <rect x="76" y="118" width="28" height="25" rx="2" fill={color} opacity="0.7" />
      <defs>
        <marker id="arr2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#e74c3c" />
        </marker>
      </defs>
      <path d="M135 75 Q200 52 248 42" stroke="#e74c3c" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arr2)" />
      <path d="M135 95 Q200 88 252 88" stroke="#e74c3c" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arr2)" />
      <path d="M135 115 Q200 122 248 130" stroke="#e74c3c" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arr2)" />
      <circle cx="270" cy="88" r="38" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M270 68 L270 92" stroke="#e74c3c" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="270" cy="100" r="5" fill="#e74c3c" />
    </svg>
  ),

  // 3: Phishing – Hook + email envelope
  3: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M230 10Q230 82 198 98Q170 112 164 96Q158 80 176 77Q190 74 190 86" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M190 86Q196 96 188 101" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="230" y1="10" x2="262" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="28" y="82" width="108" height="60" rx="7" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <path d="M28 92L82 122L136 92" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="82" cy="120" r="16" fill="white" stroke={color} strokeWidth="1.5" />
      <circle cx="82" cy="120" r="8" fill="none" stroke={color} strokeWidth="2" />
      <path d="M82 112L82 116M82 124L82 128M74 120L78 120M86 120L90 120" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="305" cy="105" r="30" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M305 85 L305 108" stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <circle cx="305" cy="116" r="5" fill="#e74c3c" />
    </svg>
  ),

  // 4: Ransomware – Folders with padlock + chain
  4: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 80Q18 74 24 74L88 74L95 64L150 64Q156 64 156 70L156 138Q156 144 150 144L24 144Q18 144 18 138Z" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <path d="M35 98Q35 92 41 92L105 92L112 82L167 82Q173 82 173 88L173 144Q173 150 167 150L41 150Q35 150 35 144Z" fill={`${color}08`} stroke={color} strokeWidth="1.5" opacity="0.8" />
      <rect x="155" y="92" width="46" height="36" rx="7" fill={color} />
      <path d="M163 92Q163 75 178 75Q193 75 193 92" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="178" cy="108" r="6.5" fill="white" />
      <rect x="175" y="108" width="6" height="12" rx="3" fill="white" />
      <circle cx="240" cy="60" r="11" stroke="#e74c3c" strokeWidth="3" fill="none" />
      <circle cx="260" cy="48" r="11" stroke="#e74c3c" strokeWidth="3" fill="none" />
      <circle cx="280" cy="36" r="11" stroke="#e74c3c" strokeWidth="3" fill="none" />
      <circle cx="300" cy="52" r="11" stroke="#e74c3c" strokeWidth="3" fill="none" />
      <circle cx="318" cy="68" r="11" stroke="#e74c3c" strokeWidth="3" fill="none" />
    </svg>
  ),

  // 5: Terminal server – Monitor with Log Off button
  5: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="38" y="12" width="210" height="118" rx="10" fill={`${color}15`} stroke={color} strokeWidth="2.5" />
      <rect x="50" y="23" width="186" height="88" rx="5" fill="white" stroke={`${color}25`} strokeWidth="1" />
      <rect x="126" y="111" width="34" height="9" rx="4.5" fill={`${color}40`} />
      <rect x="110" y="120" width="66" height="5" rx="2.5" fill={`${color}30`} />
      <rect x="65" y="36" width="120" height="10" rx="3" fill={`${color}22`} />
      <rect x="65" y="54" width="120" height="15" rx="3" fill={`${color}10`} stroke={`${color}35`} strokeWidth="1" />
      <rect x="65" y="74" width="120" height="15" rx="3" fill={`${color}10`} stroke={`${color}35`} strokeWidth="1" />
      <rect x="76" y="93" width="98" height="13" rx="5" fill={color} />
      <rect x="82" y="96" width="86" height="7" rx="3.5" fill="white" opacity="0.25" />
      <defs>
        <marker id="arr5" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#e74c3c" />
        </marker>
      </defs>
      <path d="M278 99 L262 99" stroke="#e74c3c" strokeWidth="2" markerEnd="url(#arr5)" />
      <circle cx="304" cy="99" r="28" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M296 90 L312 99 L296 108" stroke="#e74c3c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M291 99L310 99" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  // 6: VPN – Home → Globe → Office
  6: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 108L18 142L70 142L70 108L44 84Z" fill={`${color}18`} stroke={color} strokeWidth="2" />
      <path d="M12 110 L44 86 L76 110" stroke={color} strokeWidth="2" fill="none" />
      <rect x="34" y="120" width="20" height="22" rx="2" fill={color} opacity="0.6" />
      <circle cx="180" cy="94" r="42" fill={`${color}08`} stroke={color} strokeWidth="1.5" strokeDasharray="6,4" />
      <ellipse cx="180" cy="94" rx="20" ry="42" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4,4" />
      <line x1="138" y1="94" x2="222" y2="94" stroke={color} strokeWidth="1" strokeDasharray="4,4" />
      <line x1="180" y1="52" x2="180" y2="136" stroke={color} strokeWidth="1" strokeDasharray="4,4" />
      <circle cx="180" cy="55" r="13" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="173" y="53" width="14" height="12" rx="3" fill={color} />
      <path d="M176 53Q176 46 180 46Q184 46 184 53" stroke={color} strokeWidth="2" fill="none" />
      <rect x="298" y="80" width="56" height="58" rx="3" fill={`${color}18`} stroke={color} strokeWidth="2" />
      <rect x="306" y="88" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="322" y="88" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="338" y="88" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="306" y="104" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="322" y="104" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="338" y="104" width="12" height="11" rx="2" fill={color} opacity="0.5" />
      <rect x="314" y="118" width="22" height="20" rx="2" fill={color} opacity="0.7" />
      <path d="M70 108 Q120 94 138 94" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M222 94 Q270 94 298 112" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // 7: USB risks – USB stick + warning triangle
  7: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="72" y="68" width="128" height="46" rx="10" fill={`${color}20`} stroke={color} strokeWidth="2.5" />
      <rect x="200" y="80" width="40" height="22" rx="3" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
      <rect x="207" y="85" width="8" height="6" rx="1.5" fill={color} opacity="0.6" />
      <rect x="222" y="85" width="8" height="6" rx="1.5" fill={color} opacity="0.6" />
      <rect x="72" y="60" width="128" height="12" rx="5" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
      <circle cx="104" cy="91" r="9" fill="#27ae60" opacity="0.65" />
      <circle cx="104" cy="91" r="5" fill="#27ae60" opacity="0.9" />
      <path d="M188 12 L240 100 L136 100 Z" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="188" y1="34" x2="188" y2="72" stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="188" cy="83" r="5" fill="#e74c3c" />
      <circle cx="48" cy="128" r="18" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2" />
      <path d="M43 121 L48 116 L53 121 M48 116 L48 136" stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="312" cy="128" r="18" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2" />
      <path d="M306 128L312 120L318 128L312 136Z" fill="#e74c3c" opacity="0.85" />
    </svg>
  ),

  // 8: Software installation – Download arrow + approved / rejected
  8: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="18" width="174" height="118" rx="8" fill={`${color}10`} stroke={color} strokeWidth="2" />
      <rect x="28" y="18" width="174" height="26" rx="8" fill={`${color}28`} />
      <circle cx="46" cy="31" r="5.5" fill="#e74c3c" opacity="0.7" />
      <circle cx="63" cy="31" r="5.5" fill="#f39c12" opacity="0.7" />
      <circle cx="80" cy="31" r="5.5" fill="#27ae60" opacity="0.7" />
      <path d="M115 55 L115 100" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M93 88 L115 112 L137 88" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="90" y1="116" x2="140" y2="116" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="290" cy="60" r="36" fill="#f0fdf4" stroke="#27ae60" strokeWidth="3" />
      <path d="M272 60 L285 73 L310 46" stroke="#27ae60" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="248" cy="122" r="24" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M238 112 L258 132 M258 112 L238 132" stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),

  // 9: File storage – Server (green) vs Desktop (red)
  9: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="18" width="80" height="112" rx="8" fill={`${color}15`} stroke={color} strokeWidth="2" />
      {[28, 48, 68, 88, 108].map((y, i) => (
        <g key={i}>
          <rect x="24" y={y} width="68" height="16" rx="3" fill={`${color}20`} stroke={`${color}45`} strokeWidth="1" />
          <circle cx="33" cy={y + 8} r="4" fill={i < 3 ? '#27ae60' : '#f39c12'} />
          <rect x="42" y={y + 5} width="42" height="6" rx="3" fill={color} opacity="0.3" />
        </g>
      ))}
      <circle cx="58" cy="142" r="14" fill="#f0fdf4" stroke="#27ae60" strokeWidth="2.5" />
      <path d="M51 142L56 147L66 134" stroke="#27ae60" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M98 42 Q160 20 220 40" stroke={color} strokeWidth="1.5" strokeDasharray="5,3" fill="none" />
      <circle cx="180" cy="25" r="22" fill={`${color}18`} stroke={color} strokeWidth="1.5" />
      <path d="M166 30Q166 14 180 12Q194 10 198 19Q204 10 213 15Q213 30 205 30Z" fill={color} opacity="0.55" />
      <rect x="255" y="58" width="88" height="56" rx="6" fill="#f9fafb" stroke="#9ca3af" strokeWidth="2" />
      <rect x="264" y="66" width="70" height="38" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="284" y="114" width="28" height="8" rx="4" fill="#9ca3af" opacity="0.5" />
      <rect x="260" y="122" width="78" height="5" rx="2.5" fill="#9ca3af" opacity="0.35" />
      <circle cx="299" cy="142" r="14" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M292 135 L306 149 M306 135 L292 149" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  // 10: Shared office – Two people, one watching
  10: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="108" width="324" height="9" rx="4" fill={`${color}28`} stroke={color} strokeWidth="1.5" />
      <rect x="28" y="117" width="12" height="24" rx="3" fill={`${color}20`} />
      <rect x="320" y="117" width="12" height="24" rx="3" fill={`${color}20`} />
      <rect x="28" y="55" width="82" height="53" rx="5" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <rect x="36" y="62" width="66" height="38" rx="3" fill="white" />
      <rect x="55" y="108" width="26" height="6" rx="3" fill={`${color}38`} />
      <circle cx="70" cy="36" r="18" fill={`${color}18`} stroke={color} strokeWidth="2" />
      <path d="M45 55 Q45 40 70 38 Q95 40 95 55" fill={`${color}18`} stroke={color} strokeWidth="2" />
      <rect x="44" y="74" width="18" height="14" rx="3" fill={color} opacity="0.85" />
      <path d="M48 74Q48 67 53 67Q58 67 58 74" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="53" cy="80" r="2.5" fill="white" />
      <rect x="250" y="55" width="82" height="53" rx="5" fill="#f9fafb" stroke="#9ca3af" strokeWidth="2" />
      <rect x="258" y="62" width="66" height="38" rx="3" fill="white" />
      <rect x="277" y="108" width="26" height="6" rx="3" fill="#9ca3af" opacity="0.4" />
      <circle cx="291" cy="36" r="18" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
      <path d="M266 55 Q266 40 291 38 Q316 40 316 55" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
      <ellipse cx="291" cy="92" rx="24" ry="12" fill="none" stroke="#e74c3c" strokeWidth="2" />
      <circle cx="291" cy="92" r="7" fill="#e74c3c" opacity="0.7" />
      <path d="M267 80 L281 87" stroke="#e74c3c" strokeWidth="1.5" />
      <path d="M315 80 L301 87" stroke="#e74c3c" strokeWidth="1.5" />
    </svg>
  ),

  // 11: Teams – Chat bubble + phishing warning
  11: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16Q22 6 33 6L208 6Q219 6 219 16L219 94Q219 104 208 104L136 104L112 126L112 104L33 104Q22 104 22 94Z" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <rect x="38" y="24" width="165" height="11" rx="5.5" fill={`${color}35`} />
      <rect x="38" y="44" width="128" height="10" rx="5" fill={`${color}20`} />
      <rect x="38" y="62" width="148" height="10" rx="5" fill={`${color}20`} />
      <rect x="38" y="80" width="108" height="10" rx="5" fill={`${color}15`} />
      <rect x="172" y="20" width="34" height="7" rx="3.5" fill={color} opacity="0.8" />
      <rect x="185" y="20" width="7" height="25" rx="3.5" fill={color} opacity="0.8" />
      <path d="M240 32 L332 138 L148 138 Z" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="240" y1="58" x2="240" y2="105" stroke="#e74c3c" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="240" cy="116" r="6" fill="#e74c3c" />
    </svg>
  ),

  // 12: Clean desk – Monitor locked + shredder
  12: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="110" width="324" height="10" rx="4" fill={`${color}28`} stroke={color} strokeWidth="2" />
      <rect x="28" y="120" width="13" height="24" rx="3" fill={`${color}20`} />
      <rect x="319" y="120" width="13" height="24" rx="3" fill={`${color}20`} />
      <rect x="108" y="48" width="98" height="62" rx="6" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <rect x="116" y="55" width="82" height="46" rx="3" fill="white" />
      <rect x="145" y="110" width="24" height="7" rx="3.5" fill={`${color}40`} />
      <rect x="140" y="74" width="34" height="24" rx="5" fill={color} />
      <path d="M148 74Q148 62 157 62Q166 62 166 74" stroke={color} strokeWidth="3.5" fill="none" />
      <circle cx="157" cy="85" r="4.5" fill="white" />
      <rect x="155" y="85" width="4" height="10" rx="2" fill="white" />
      <rect x="18" y="80" width="68" height="30" rx="4" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
      <rect x="25" y="87" width="54" height="5" rx="2.5" fill={`${color}40`} />
      <rect x="25" y="97" width="40" height="5" rx="2.5" fill={`${color}25`} />
      <rect x="274" y="80" width="60" height="38" rx="5" fill={`${color}18`} stroke={color} strokeWidth="2" />
      <rect x="280" y="84" width="48" height="14" rx="3" fill={color} opacity="0.45" />
      <rect x="284" y="64" width="36" height="20" rx="3" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="290" y="69" width="24" height="3.5" rx="1.5" fill={color} opacity="0.4" />
      <rect x="290" y="76" width="18" height="3.5" rx="1.5" fill={color} opacity="0.3" />
    </svg>
  ),

  // 13: Reporting – Phone + alert + signal waves
  13: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="128" y="10" width="70" height="128" rx="14" fill={`${color}15`} stroke={color} strokeWidth="2.5" />
      <rect x="138" y="22" width="50" height="82" rx="5" fill="white" />
      <circle cx="163" cy="128" r="7" fill={`${color}40`} stroke={color} strokeWidth="1" />
      <circle cx="163" cy="62" r="26" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M163 44 L163 67" stroke="#e74c3c" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="163" cy="75" r="4.5" fill="#e74c3c" />
      <path d="M204 38 Q220 56 204 74" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M216 28 Q238 56 216 84" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M228 18 Q258 56 228 94" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d="M122 38 Q106 56 122 74" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M110 28 Q88 56 110 84" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M98 18 Q68 56 98 94" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
    </svg>
  ),

  // 14: CIO Authority – Person + key + badge
  14: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="130" cy="50" r="34" fill={`${color}18`} stroke={color} strokeWidth="2.5" />
      <path d="M82 142 Q82 110 130 106 Q178 110 178 142" fill={`${color}18`} stroke={color} strokeWidth="2.5" />
      <circle cx="117" cy="45" r="5.5" fill={color} opacity="0.55" />
      <circle cx="143" cy="45" r="5.5" fill={color} opacity="0.55" />
      <path d="M119 62 Q130 70 141 62" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="104" y="80" width="52" height="38" rx="6" fill="white" stroke={color} strokeWidth="2" />
      <rect x="110" y="87" width="40" height="6" rx="3" fill={color} opacity="0.65" />
      <rect x="110" y="97" width="28" height="4.5" rx="2.5" fill={color} opacity="0.4" />
      <rect x="110" y="106" width="34" height="4.5" rx="2.5" fill={color} opacity="0.4" />
      <circle cx="272" cy="80" r="24" fill={`${color}18`} stroke={color} strokeWidth="2.5" />
      <circle cx="272" cy="80" r="13" fill="none" stroke={color} strokeWidth="2" />
      <rect x="292" y="77" width="46" height="6" rx="3" fill={color} opacity="0.8" />
      <rect x="323" y="83" width="12" height="9" rx="3" fill={color} opacity="0.6" />
      <rect x="306" y="83" width="12" height="9" rx="3" fill={color} opacity="0.6" />
      <defs>
        <marker id="arr14" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill={color} />
        </marker>
      </defs>
      <path d="M192 100 L244 88" stroke={color} strokeWidth="2" markerEnd="url(#arr14)" strokeDasharray="4,3" />
    </svg>
  ),

  // 15: Summary – Star + two checklists
  15: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M180 12L196 58L244 58L208 84L222 130L180 104L138 130L152 84L116 58L164 58Z" fill={`${color}22`} stroke={color} strokeWidth="2.5" />
      <path d="M180 28L191 60L224 60L199 76L208 108L180 92L152 108L161 76L136 60L169 60Z" fill={color} opacity="0.35" />
      <rect x="18" y="24" width="92" height="115" rx="6" fill="white" stroke={`${color}35`} strokeWidth="1.5" />
      {[40, 57, 74, 91, 108].map((y, i) => (
        <g key={i}>
          <circle cx="31" cy={y} r="7" fill={i < 3 ? '#27ae60' : `${color}`} opacity={i < 3 ? 1 : 0.45} />
          {i < 3 && <path d={`M27.5 ${y} L30 ${y + 3} L35.5 ${y - 4}`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="43" y={y - 5} width="60" height="10" rx="5" fill={i < 3 ? `${color}28` : `${color}12`} />
        </g>
      ))}
      <rect x="250" y="24" width="92" height="115" rx="6" fill="white" stroke={`${color}35`} strokeWidth="1.5" />
      {[40, 57, 74, 91, 108].map((y, i) => (
        <g key={i}>
          <circle cx="263" cy={y} r="7" fill={i < 4 ? '#27ae60' : `${color}`} opacity={i < 4 ? 1 : 0.4} />
          {i < 4 && <path d={`M259.5 ${y} L262 ${y + 3} L267.5 ${y - 4}`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="275" y={y - 5} width="60" height="10" rx="5" fill={i < 4 ? `${color}28` : `${color}12`} />
        </g>
      ))}
    </svg>
  ),

  // 16: Social engineering – Phone impersonation
  16: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="128" y="10" width="70" height="128" rx="14" fill={`${color}15`} stroke={color} strokeWidth="2.5" />
      <rect x="138" y="22" width="50" height="82" rx="5" fill="white" />
      <circle cx="163" cy="128" r="7" fill={`${color}40`} stroke={color} strokeWidth="1" />
      <circle cx="163" cy="62" r="26" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2.5" />
      <path d="M163 44 L163 67" stroke="#e74c3c" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="163" cy="75" r="4.5" fill="#e74c3c" />
      {/* Mask / actor icon on right */}
      <circle cx="300" cy="55" r="30" fill={`${color}12`} stroke={color} strokeWidth="2" />
      <path d="M280 50 Q300 38 320 50 Q320 70 300 74 Q280 70 280 50Z" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
      <path d="M290 60 Q300 66 310 60" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="292" cy="52" r="3.5" fill={color} opacity="0.6" />
      <circle cx="308" cy="52" r="3.5" fill={color} opacity="0.6" />
      <circle cx="244" cy="110" r="22" fill="#fef2f2" stroke="#e74c3c" strokeWidth="2" />
      <path d="M235 102 L253 120 M253 102 L235 120" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <path d="M198 75 Q218 88 238 100" stroke={color} strokeWidth="2" strokeDasharray="4,3" />
    </svg>
  ),

  // 17: Information classification – tiers
  17: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tier pyramid */}
      <path d="M180 18 L300 128 L60 128 Z" fill={`${color}08`} stroke={color} strokeWidth="2" />
      {/* High tier */}
      <rect x="148" y="28" width="64" height="30" rx="3" fill="#e74c3c" opacity="0.75" />
      <rect x="155" y="36" width="50" height="6" rx="3" fill="white" opacity="0.8" />
      <rect x="162" y="46" width="36" height="5" rx="2.5" fill="white" opacity="0.6" />
      {/* Medium tier */}
      <rect x="118" y="66" width="124" height="30" rx="3" fill="#f39c12" opacity="0.7" />
      <rect x="126" y="74" width="108" height="6" rx="3" fill="white" opacity="0.8" />
      <rect x="132" y="84" width="96" height="5" rx="2.5" fill="white" opacity="0.6" />
      {/* Low tier */}
      <rect x="76" y="104" width="208" height="24" rx="3" fill="#27ae60" opacity="0.65" />
      <rect x="86" y="111" width="188" height="6" rx="3" fill="white" opacity="0.8" />
      {/* Lock icons */}
      <rect x="320" y="32" width="28" height="22" rx="4" fill={color} opacity="0.8" />
      <path d="M325 32Q325 24 334 24Q343 24 343 32" stroke={color} strokeWidth="2.5" fill="none" />
      <circle cx="334" cy="42" r="3" fill="white" />
      <rect x="315" y="70" width="22" height="18" rx="3" fill={color} opacity="0.5" />
      <path d="M320 70Q320 64 326 64Q332 64 332 70" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  ),

  // 18: Incident reporting – report button + bell
  18: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Alert bell */}
      <path d="M115 52 Q115 30 140 26 Q165 22 175 52 L180 90 L100 90 Z" fill={`${color}20`} stroke={color} strokeWidth="2" />
      <rect x="100" y="88" width="80" height="10" rx="5" fill={color} opacity="0.5" />
      <circle cx="140" cy="102" r="10" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
      {/* Report button */}
      <rect x="220" y="50" width="118" height="50" rx="10" fill={color} />
      <rect x="228" y="58" width="102" height="34" rx="7" fill="white" opacity="0.15" />
      <rect x="236" y="64" width="86" height="8" rx="4" fill="white" opacity="0.8" />
      <rect x="242" y="76" width="74" height="6" rx="3" fill="white" opacity="0.6" />
      {/* Urgency arrows */}
      <path d="M36 62 L60 74 L36 86" fill={color} opacity="0.5" />
      <path d="M42 52 L72 72 L42 92" fill={color} opacity="0.3" />
      {/* Checkmark circle */}
      <circle cx="279" cy="120" r="20" fill="#f0fdf4" stroke="#27ae60" strokeWidth="2.5" />
      <path d="M268 120 L276 128 L292 112" stroke="#27ae60" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 19: Governance – CIO authority chain
  19: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* CIO at top */}
      <circle cx="180" cy="36" r="26" fill={`${color}20`} stroke={color} strokeWidth="2.5" />
      <circle cx="168" cy="30" r="4.5" fill={color} opacity="0.5" />
      <circle cx="192" cy="30" r="4.5" fill={color} opacity="0.5" />
      <path d="M170 44 Q180 51 190 44" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="160" y="54" width="40" height="26" rx="5" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="165" y="58" width="30" height="5" rx="2.5" fill={color} opacity="0.6" />
      <rect x="165" y="66" width="22" height="4" rx="2" fill={color} opacity="0.4" />
      <rect x="165" y="73" width="26" height="4" rx="2" fill={color} opacity="0.4" />
      {/* Lines down */}
      <path d="M180 80 L180 100" stroke={color} strokeWidth="2" />
      <path d="M180 100 L100 100" stroke={color} strokeWidth="2" />
      <path d="M180 100 L260 100" stroke={color} strokeWidth="2" />
      {/* Left: Agas */}
      <rect x="60" y="100" width="80" height="36" rx="6" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
      <rect x="68" y="108" width="64" height="6" rx="3" fill={color} opacity="0.5" />
      <rect x="72" y="118" width="56" height="5" rx="2.5" fill={color} opacity="0.35" />
      <rect x="72" y="126" width="44" height="4" rx="2" fill={color} opacity="0.25" />
      {/* Right: Policy */}
      <rect x="220" y="100" width="80" height="36" rx="6" fill="#fef2f2" stroke="#e74c3c" strokeWidth="1.5" />
      <rect x="228" y="108" width="64" height="6" rx="3" fill="#e74c3c" opacity="0.5" />
      <rect x="232" y="118" width="56" height="5" rx="2.5" fill="#e74c3c" opacity="0.35" />
      <rect x="232" y="126" width="44" height="4" rx="2" fill="#e74c3c" opacity="0.25" />
    </svg>
  ),

  // 20: Security culture – team shield
  20: ({ color }) => (
    <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central shield */}
      <path d="M180 12L228 36L228 80Q228 118 180 134Q132 118 132 80L132 36Z" fill={`${color}20`} stroke={color} strokeWidth="2.5" />
      <path d="M164 72 L177 85 L198 60" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* People around shield */}
      {[
        { cx: 52, cy: 60 }, { cx: 52, cy: 108 },
        { cx: 308, cy: 60 }, { cx: 308, cy: 108 },
      ].map(({ cx, cy }, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy - 12} r="12" fill={`${color}18`} stroke={color} strokeWidth="1.5" />
          <path d={`M${cx - 18} ${cy + 8} Q${cx - 18} ${cy - 2} ${cx} ${cy - 1} Q${cx + 18} ${cy - 2} ${cx + 18} ${cy + 8}`}
            fill={`${color}18`} stroke={color} strokeWidth="1.5" />
        </g>
      ))}
      {/* Connection lines */}
      <path d="M70 68 L132 72" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      <path d="M70 108 L132 98" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      <path d="M228 72 L290 68" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      <path d="M228 98 L290 108" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      {/* Stars */}
      <circle cx="52" cy="140" r="5" fill="#f1c40f" />
      <circle cx="308" cy="140" r="5" fill="#f1c40f" />
      <circle cx="180" cy="142" r="6" fill="#f1c40f" />
    </svg>
  ),
};

export default illustrations;
