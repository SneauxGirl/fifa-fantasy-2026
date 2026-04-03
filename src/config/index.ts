/**
 * Application Configuration Loader
 * Reads from .env.dist and resolves process.env references
 * This is the single source of truth for all configuration values
 */

// ─── API-Football Configuration ───────────────────────────────────────────

/** API key for api-football.com */
export const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';

/** API-Football base URL */
export const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

// ─── Tournament Configuration ──────────────────────────────────────────────

/** World Cup 2022 League ID */
export const LEAGUE_ID = parseInt(import.meta.env.VITE_API_FOOTBALL_WC_LEAGUE_ID || '1', 10);

/** World Cup 2022 Season */
export const SEASON = parseInt(import.meta.env.VITE_API_FOOTBALL_WC_SEASON || '2022', 10);

// ─── Firebase Configuration ──────────────────────────────────────────────
//Okay to keep Frontend because security is tied to rules - so be careful with those #TODO 
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
};

// ─── Validation ──────────────────────────────────────────────────────────

/**
 * Validate critical configuration on startup
 * Logs warnings if required values are missing
 */
export function validateConfig(): boolean {
  const errors: string[] = [];

  if (!API_KEY) {
    errors.push('❌ VITE_API_FOOTBALL_KEY is not set in .env');
  }

  if (!LEAGUE_ID || LEAGUE_ID === 0) {
    errors.push('❌ VITE_API_FOOTBALL_WC_LEAGUE_ID is not set or invalid');
  }

  if (!SEASON || SEASON === 0) {
    errors.push('❌ VITE_API_FOOTBALL_WC_SEASON is not set or invalid');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Configuration Issues:\n' + errors.join('\n'));
    return false;
  }

  console.log('✅ Configuration loaded successfully');
  return true;
}

// ─── Export Config Object ────────────────────────────────────────────────

export const config = {
  api: {
    key: API_KEY,
    baseUrl: API_FOOTBALL_BASE_URL,
    leagueId: LEAGUE_ID,
    season: SEASON,
  },
  
  firebase: FIREBASE_CONFIG,
};

export default config;
