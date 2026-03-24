/* ============================================
   config.js — App Configuration
   PathFinder Career Guidance Platform

   HOW TO CONFIGURE:
   1. Local Dev  → set MODE to 'local', add ANTHROPIC_API_KEY (backend/.env)
   2. Production → set MODE to 'production', set BACKEND_URL to your Lambda URL
   ============================================ */

const CONFIG = {

  // ─── Set to 'local' during development, 'production' after AWS deploy ───
  MODE: 'local',

  // ─── Local backend (Node.js Express server running on port 3001) ───
  LOCAL_API_URL: 'http://localhost:3001/api/analyze',

  // ─── Production backend (AWS API Gateway → Lambda URL) ───
  // Replace with your actual AWS API Gateway URL after deploying
  PRODUCTION_API_URL: 'https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prod/analyze',

  // ─── Claude model to use ───
  MODEL: 'claude-sonnet-4-20250514',

  // ─── App metadata ───
  APP_NAME: 'PathFinder',
  APP_VERSION: '1.0.0',

};

// Resolve which API URL to use
CONFIG.API_URL = CONFIG.MODE === 'production'
  ? CONFIG.PRODUCTION_API_URL
  : CONFIG.LOCAL_API_URL;

// Freeze config so it can't be accidentally mutated
Object.freeze(CONFIG);
