/**
 * Stream API Sources and Base Endpoint Configurations
 */

const ENDPOINTS = [
  { name: "Zlatans", url: "https://livelive24.com/test/processed_matches_prioritized.json" },
  { name: "Main", url: "https://livelive24.com/main.json" },
  { name: "WWHD ⚽", url: "https://livelive24.com/test/processed_matches_other.json" },
  { name: "CR7", url: "https://livelive24.com/streamedpk.json" },
  { name: "Pele", url: "https://livelive24.com/ppv.json" },
  { name: "Zidane", url: "https://livelive24.com/onlive.json" },
  { name: "Buffsports", url: "https://livelive24.com/buffsports.json" }
];

const API_BASES = {
  onsport: "https://api.onsport365.live/v5/matches/view?lang=en&id=",
  sportplus: "https://api.sportplustv.live/v5/matches/index?sport_id="
};
