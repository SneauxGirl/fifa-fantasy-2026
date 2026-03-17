// ==============================
// Country Name Mapping
// ==============================
// Maps API-Football's Anglicized nationality strings to FIFA 3-letter codes
// and each nation's locally/legally preferred name.
//
// API returns: player.nationality = "Netherlands"
// We store:   nationalityCode = "NED", nationalityLocal = "Nederland"
//
// Source for local names: FIFA/IOC official designations and each nation's
// own constitutional or commonly preferred self-designation.
// ==============================

export interface CountryEntry {
  code: string;       // FIFA 3-letter code
  localName: string;  // Nation's own preferred name
}

// Keyed by the Anglicized string API-Football returns in player.nationality / team.country
export const COUNTRY_MAP: Record<string, CountryEntry> = {
  // Africa
  Algeria:          { code: "ALG", localName: "الجزائر" },
  Angola:           { code: "ANG", localName: "Angola" },
  Cameroon:         { code: "CMR", localName: "Cameroun" },
  "DR Congo":       { code: "COD", localName: "République démocratique du Congo" },
  Egypt:            { code: "EGY", localName: "مصر" },
  Ghana:            { code: "GHA", localName: "Ghana" },
  "Ivory Coast":    { code: "CIV", localName: "Côte d'Ivoire" },
  Kenya:            { code: "KEN", localName: "Kenya" },
  Mali:             { code: "MLI", localName: "Mali" },
  Morocco:          { code: "MAR", localName: "المغرب" },
  Nigeria:          { code: "NGA", localName: "Nigeria" },
  Senegal:          { code: "SEN", localName: "Sénégal" },
  "South Africa":   { code: "RSA", localName: "iNingizimu Afrika" },
  Tunisia:          { code: "TUN", localName: "تونس" },
  Zimbabwe:         { code: "ZIM", localName: "Zimbabwe" },

  // Asia
  Australia:        { code: "AUS", localName: "Australia" },
  China:            { code: "CHN", localName: "中国" },
  Indonesia:        { code: "IDN", localName: "Indonesia" },
  Iran:             { code: "IRN", localName: "ایران" },
  Iraq:             { code: "IRQ", localName: "العراق" },
  Japan:            { code: "JPN", localName: "日本" },
  Jordan:           { code: "JOR", localName: "الأردن" },
  "New Zealand":    { code: "NZL", localName: "Aotearoa New Zealand" },
  Qatar:            { code: "QAT", localName: "قطر" },
  "Saudi Arabia":   { code: "KSA", localName: "المملكة العربية السعودية" },
  "South Korea":    { code: "KOR", localName: "대한민국" },
  Uzbekistan:       { code: "UZB", localName: "O'zbekiston" },

  // CONCACAF
  Canada:           { code: "CAN", localName: "Canada" },
  "Costa Rica":     { code: "CRC", localName: "Costa Rica" },
  Cuba:             { code: "CUB", localName: "Cuba" },
  Honduras:         { code: "HON", localName: "Honduras" },
  Jamaica:          { code: "JAM", localName: "Jamaica" },
  Mexico:           { code: "MEX", localName: "México" },
  Panama:           { code: "PAN", localName: "Panamá" },
  "United States":  { code: "USA", localName: "United States" },

  // CONMEBOL
  Argentina:        { code: "ARG", localName: "Argentina" },
  Bolivia:          { code: "BOL", localName: "Bolivia" },
  Brazil:           { code: "BRA", localName: "Brasil" },
  Chile:            { code: "CHI", localName: "Chile" },
  Colombia:         { code: "COL", localName: "Colombia" },
  Ecuador:          { code: "ECU", localName: "Ecuador" },
  Paraguay:         { code: "PAR", localName: "Paraguay" },
  Peru:             { code: "PER", localName: "Perú" },
  Uruguay:          { code: "URU", localName: "Uruguay" },
  Venezuela:        { code: "VEN", localName: "Venezuela" },

  // Europe
  Albania:          { code: "ALB", localName: "Shqipëria" },
  Austria:          { code: "AUT", localName: "Österreich" },
  Belgium:          { code: "BEL", localName: "België / Belgique" },
  "Bosnia and Herzegovina": { code: "BIH", localName: "Bosna i Hercegovina" },
  Croatia:          { code: "CRO", localName: "Hrvatska" },
  "Czech Republic": { code: "CZE", localName: "Česko" },
  Denmark:          { code: "DEN", localName: "Danmark" },
  England:          { code: "ENG", localName: "England" },
  Finland:          { code: "FIN", localName: "Suomi" },
  France:           { code: "FRA", localName: "France" },
  Georgia:          { code: "GEO", localName: "საქართველო" },
  Germany:          { code: "GER", localName: "Deutschland" },
  Greece:           { code: "GRE", localName: "Ελλάδα" },
  Hungary:          { code: "HUN", localName: "Magyarország" },
  Ireland:          { code: "IRL", localName: "Éire" },
  Italy:            { code: "ITA", localName: "Italia" },
  Netherlands:      { code: "NED", localName: "Nederland" },
  "North Macedonia":{ code: "MKD", localName: "Северна Македонија" },
  Norway:           { code: "NOR", localName: "Norge" },
  Poland:           { code: "POL", localName: "Polska" },
  Portugal:         { code: "POR", localName: "Portugal" },
  Romania:          { code: "ROU", localName: "România" },
  Scotland:         { code: "SCO", localName: "Scotland / Alba" },
  Serbia:           { code: "SRB", localName: "Srbija" },
  Slovakia:         { code: "SVK", localName: "Slovensko" },
  Slovenia:         { code: "SVN", localName: "Slovenija" },
  Spain:            { code: "ESP", localName: "España" },
  Sweden:           { code: "SWE", localName: "Sverige" },
  Switzerland:      { code: "SUI", localName: "Schweiz / Suisse / Svizzera" },
  Turkey:           { code: "TUR", localName: "Türkiye" },
  Ukraine:          { code: "UKR", localName: "Україна" },
  Wales:            { code: "WAL", localName: "Cymru" },
};

// Reverse lookup: FIFA code → { anglicizedName, localName }
export const CODE_MAP: Record<string, { anglicizedName: string; localName: string }> =
  Object.entries(COUNTRY_MAP).reduce(
    (acc, [anglicized, { code, localName }]) => {
      acc[code] = { anglicizedName: anglicized, localName };
      return acc;
    },
    {} as Record<string, { anglicizedName: string; localName: string }>
  );

// Utility: resolve FIFA code and local name from an API nationality string.
// Returns undefined values if the country isn't in the map (safe to handle at call site). //TODO - how to handle?
export function resolveCountry(apiNationality: string): CountryEntry | undefined {
  return COUNTRY_MAP[apiNationality];
}
