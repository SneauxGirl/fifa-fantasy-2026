import mappings from '../data/APItoFIFAmaps.json';

export function positionToFifa(apiPosition: string): string {
  return mappings.positions.apiToFifa[apiPosition as keyof typeof mappings.positions.apiToFifa] || apiPosition;
}

export function countryToFifa(apiCode: string): string {
  return mappings.countryCodes.apiToFifa[apiCode as keyof typeof mappings.countryCodes.apiToFifa] || apiCode;
}
