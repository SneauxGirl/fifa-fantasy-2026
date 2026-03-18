// Static reference: national team display data by FIFA country code.
// Colors and flag emojis are permanent display data — not replaced by API in Phase 3.
//
// Flag emojis: standard Unicode Regional Indicator pairs (ISO 3166-1 alpha-2).
// ENG / SCO / WAL use Unicode tag sequences (subdivision flags) — render fine in
// all modern browsers and iOS/Android. No API or CDN dependency needed.
//
// Usage:
//   nationalColors["NED"]  // → ["#FF5700", "#FFFFFF", "#21468B"]
//   nationalFlags["NED"]   // → "🇳🇱"
export const nationalColors: Record<string, string[]> = {
  // Africa
  ALG: ["#006233", "#FFFFFF", "#EF4135"],       // Algeria
  ANG: ["#007A33", "#FFFFFF", "#D21034"],       // Angola
  CMR: ["#007A5E", "#FCD116", "#CE1126"],       // Cameroon
  COD: ["#007FFF", "#F7D618", "#CE1126"],       // DR Congo
  EGY: ["#CE1126", "#FFFFFF", "#000000"],       // Egypt
  GHA: ["#006B3F", "#FCD116", "#CE1126"],       // Ghana
  CIV: ["#F77F00", "#FFFFFF", "#009E60"],       // Ivory Coast
  KEN: ["#006233", "#FFFFFF", "#CE1126"],       // Kenya
  MLI: ["#14B53A", "#FCD116", "#E31B23"],       // Mali
  MAR: ["#006233", "#FFD700", "#C8102E"],       // Morocco
  NGA: ["#008751", "#FFFFFF", "#002776"],       // Nigeria
  SEN: ["#00853F", "#FDEF42", "#E31B23"],       // Senegal
  RSA: ["#007A4D", "#FFFFFF", "#DE3831"],       // South Africa
  TUN: ["#E30B17", "#FFFFFF", "#E30B17"],       // Tunisia
  ZIM: ["#007847", "#FCD116", "#E31B23"],       // Zimbabwe
  // Asia / Oceania
  AUS: ["#000066", "#FFFFFF", "#FFCC00"],       // Australia
  CHN: ["#DE2910", "#FFDE00", "#DE2910"],       // China
  IDN: ["#FF0000", "#FFFFFF", "#FF0000"],       // Indonesia
  IRN: ["#DA0000", "#FFFFFF", "#239F40"],       // Iran
  IRQ: ["#000000", "#FFFFFF", "#CE1126"],       // Iraq
  JPN: ["#BC002D", "#FFFFFF", "#BC002D"],       // Japan
  JOR: ["#006C35", "#FFFFFF", "#CE1126"],       // Jordan
  NZL: ["#000000", "#FFFFFF", "#000000"],       // New Zealand
  QAT: ["#8A1538", "#FFFFFF", "#8A1538"],       // Qatar
  KSA: ["#006C35", "#FFFFFF", "#006C35"],       // Saudi Arabia
  KOR: ["#003478", "#FFFFFF", "#C60C30"],       // South Korea
  UZB: ["#1EB53A", "#FFFFFF", "#1EB53A"],       // Uzbekistan
  // CONCACAF
  CAN: ["#FF0000", "#FFFFFF", "#FF0000"],       // Canada
  CRC: ["#006847", "#FFFFFF", "#CE1126"],       // Costa Rica
  CUB: ["#002A8F", "#FFFFFF", "#D52B1E"],       // Cuba
  HON: ["#0073CF", "#FFFFFF", "#0073CF"],       // Honduras
  JAM: ["#FED100", "#000000", "#007847"],       // Jamaica
  MEX: ["#006847", "#FFFFFF", "#CE1126"],       // Mexico
  PAN: ["#00529B", "#FFFFFF", "#D21034"],       // Panama
  USA: ["#B22234", "#FFFFFF", "#3C3B6E"],       // United States
  // CONMEBOL
  ARG: ["#75AADB", "#FFFFFF", "#F6B40E"],       // Argentina
  BOL: ["#007A33", "#FCD116", "#D21034"],       // Bolivia
  BRA: ["#FEDF00", "#009B3A", "#002776"],       // Brazil
  CHI: ["#D52B1E", "#FFFFFF", "#002868"],       // Chile
  COL: ["#FFD100", "#003893", "#CE1126"],       // Colombia
  ECU: ["#FFD100", "#003893", "#CE1126"],       // Ecuador
  PAR: ["#003893", "#FFFFFF", "#D21034"],       // Paraguay
  PER: ["#D91023", "#FFFFFF", "#D91023"],       // Peru
  URU: ["#75AADB", "#FFFFFF", "#000000"],       // Uruguay
  VEN: ["#FED100", "#003893", "#CE1126"],       // Venezuela
  // Europe
  ALB: ["#E41B17", "#FFFFFF", "#000000"],       // Albania
  AUT: ["#ED2939", "#FFFFFF", "#ED2939"],       // Austria
  BEL: ["#000000", "#FFD100", "#FF0000"],       // Belgium
  BIH: ["#002395", "#FFFFFF", "#FECB00"],       // Bosnia & Herzegovina
  CRO: ["#FF0000", "#FFFFFF", "#0000FF"],       // Croatia
  CZE: ["#11457E", "#FFFFFF", "#D7141A"],       // Czech Republic
  DEN: ["#C60C30", "#FFFFFF", "#C60C30"],       // Denmark
  ENG: ["#FFFFFF", "#C8102E", "#FFFFFF"],       // England
  FIN: ["#003580", "#FFFFFF", "#003580"],       // Finland
  FRA: ["#0055A4", "#FFFFFF", "#EF4135"],       // France
  GEO: ["#FFFFFF", "#D7141A", "#000000"],       // Georgia
  GER: ["#000000", "#DD0000", "#FFCE00"],       // Germany
  GRE: ["#0D5EAF", "#FFFFFF", "#0D5EAF"],       // Greece
  HUN: ["#CE2939", "#FFFFFF", "#436F4D"],       // Hungary
  IRL: ["#169B62", "#FFFFFF", "#169B62"],       // Ireland
  ITA: ["#009246", "#FFFFFF", "#CE2B37"],       // Italy
  NED: ["#FF5700", "#FFFFFF", "#21468B"],       // Netherlands
  MKD: ["#D20000", "#FFFFFF", "#FFDA00"],       // North Macedonia
  NOR: ["#EF2B2D", "#FFFFFF", "#002868"],       // Norway
  POL: ["#DC143C", "#FFFFFF", "#DC143C"],       // Poland
  POR: ["#006600", "#FFFFFF", "#FF0000"],       // Portugal
  ROU: ["#002B7F", "#FFFFFF", "#FCD116"],       // Romania
  SCO: ["#0065BD", "#FFFFFF", "#0065BD"],       // Scotland
  SRB: ["#C6363C", "#FFFFFF", "#002D62"],       // Serbia
  SVK: ["#0D4F8B", "#FFFFFF", "#D7141A"],       // Slovakia
  SVN: ["#005BBB", "#FFFFFF", "#EF3340"],       // Slovenia
  ESP: ["#AA151B", "#FFFFFF", "#F1BF00"],       // Spain
  SWE: ["#006AA7", "#FFFFFF", "#FECB00"],       // Sweden
  SUI: ["#FF0000", "#FFFFFF", "#000000"],       // Switzerland
  TUR: ["#E30A17", "#FFFFFF", "#E30A17"],       // Turkey
  UKR: ["#0057B7", "#FFD700", "#0057B7"],       // Ukraine
  WAL: ["#D80027", "#FFFFFF", "#D80027"],       // Wales
};

// Flag emojis by FIFA country code.
export const nationalFlags: Record<string, string> = {
  // Africa
  ALG: "🇩🇿",  // Algeria
  ANG: "🇦🇴",  // Angola
  CMR: "🇨🇲",  // Cameroon
  COD: "🇨🇩",  // DR Congo
  EGY: "🇪🇬",  // Egypt
  GHA: "🇬🇭",  // Ghana
  CIV: "🇨🇮",  // Ivory Coast
  KEN: "🇰🇪",  // Kenya
  MLI: "🇲🇱",  // Mali
  MAR: "🇲🇦",  // Morocco
  NGA: "🇳🇬",  // Nigeria
  SEN: "🇸🇳",  // Senegal
  RSA: "🇿🇦",  // South Africa
  TUN: "🇹🇳",  // Tunisia
  ZIM: "🇿🇼",  // Zimbabwe
  // Asia / Oceania
  AUS: "🇦🇺",  // Australia
  CHN: "🇨🇳",  // China
  IDN: "🇮🇩",  // Indonesia
  IRN: "🇮🇷",  // Iran
  IRQ: "🇮🇶",  // Iraq
  JPN: "🇯🇵",  // Japan
  JOR: "🇯🇴",  // Jordan
  NZL: "🇳🇿",  // New Zealand
  QAT: "🇶🇦",  // Qatar
  KSA: "🇸🇦",  // Saudi Arabia
  KOR: "🇰🇷",  // South Korea
  UZB: "🇺🇿",  // Uzbekistan
  // CONCACAF
  CAN: "🇨🇦",  // Canada
  CRC: "🇨🇷",  // Costa Rica
  CUB: "🇨🇺",  // Cuba
  HON: "🇭🇳",  // Honduras
  JAM: "🇯🇲",  // Jamaica
  MEX: "🇲🇽",  // Mexico
  PAN: "🇵🇦",  // Panama
  USA: "🇺🇸",  // United States
  // CONMEBOL
  ARG: "🇦🇷",  // Argentina
  BOL: "🇧🇴",  // Bolivia
  BRA: "🇧🇷",  // Brazil
  CHI: "🇨🇱",  // Chile
  COL: "🇨🇴",  // Colombia
  ECU: "🇪🇨",  // Ecuador
  PAR: "🇵🇾",  // Paraguay
  PER: "🇵🇪",  // Peru
  URU: "🇺🇾",  // Uruguay
  VEN: "🇻🇪",  // Venezuela
  // Europe
  ALB: "🇦🇱",  // Albania
  AUT: "🇦🇹",  // Austria
  BEL: "🇧🇪",  // Belgium
  BIH: "🇧🇦",  // Bosnia & Herzegovina
  CRO: "🇭🇷",  // Croatia
  CZE: "🇨🇿",  // Czech Republic
  DEN: "🇩🇰",  // Denmark
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",  // England (Unicode subdivision flag)
  FIN: "🇫🇮",  // Finland
  FRA: "🇫🇷",  // France
  GEO: "🇬🇪",  // Georgia
  GER: "🇩🇪",  // Germany
  GRE: "🇬🇷",  // Greece
  HUN: "🇭🇺",  // Hungary
  IRL: "🇮🇪",  // Ireland
  ITA: "🇮🇹",  // Italy
  NED: "🇳🇱",  // Netherlands
  MKD: "🇲🇰",  // North Macedonia
  NOR: "🇳🇴",  // Norway
  POL: "🇵🇱",  // Poland
  POR: "🇵🇹",  // Portugal
  ROU: "🇷🇴",  // Romania
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",  // Scotland (Unicode subdivision flag)
  SRB: "🇷🇸",  // Serbia
  SVK: "🇸🇰",  // Slovakia
  SVN: "🇸🇮",  // Slovenia
  ESP: "🇪🇸",  // Spain
  SWE: "🇸🇪",  // Sweden
  SUI: "🇨🇭",  // Switzerland
  TUR: "🇹🇷",  // Turkey
  UKR: "🇺🇦",  // Ukraine
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",  // Wales (Unicode subdivision flag)
};
