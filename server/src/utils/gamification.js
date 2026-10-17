/** Donor Passport: badges, levels, lives saved and reliability score rules. */

export const LIVES_PER_UNIT = 3; // one unit is split into red cells, plasma and platelets

// How a donor's reliability score (0-100) changes
export const RELIABILITY = { PLEDGE: 2, WITHDRAW: -3, DONATE: 10 };

const BADGES = [
  { id: 'first-drop', icon: '🩸', name: 'First Drop', description: 'Made your first donation', test: (u) => u.donationsCount >= 1 },
  { id: 'lifesaver', icon: '💪', name: 'Lifesaver', description: 'Donated 3 times', test: (u) => u.donationsCount >= 3 },
  { id: 'hero', icon: '🦸', name: 'Hero', description: 'Donated 5 times', test: (u) => u.donationsCount >= 5 },
  { id: 'legend', icon: '👑', name: 'Legend', description: 'Donated 10 times', test: (u) => u.donationsCount >= 10 },
  { id: 'reliable', icon: '⚡', name: 'Reliable Responder', description: 'Reliability score of 80 or more', test: (u) => u.reliabilityScore >= 80 },
  { id: 'universal', icon: '🌍', name: 'Universal Donor', description: 'O− blood can be given to anyone', test: (u) => u.bloodGroup === 'O-' },
  { id: 'rare-gem', icon: '💎', name: 'Rare Gem', description: 'Donor of a rare group (Rh-negative or Bombay)', test: (u) => u.bloodGroup === 'hh' || u.bloodGroup.endsWith('-') },
];

const LEVELS = [
  { min: 0, name: 'Newcomer' },
  { min: 1, name: 'Bronze Donor' },
  { min: 3, name: 'Silver Donor' },
  { min: 5, name: 'Gold Donor' },
  { min: 10, name: 'Platinum Donor' },
];

export const computeBadges = (user) =>
  BADGES.map(({ test, ...badge }) => ({ ...badge, earned: Boolean(user.isDonor && test(user)) }));

export function levelFor(donations) {
  const index = LEVELS.findLastIndex((level) => donations >= level.min);
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next ? (donations - current.min) / (next.min - current.min) : 1;
  return { name: current.name, next: next?.name ?? null, donationsToNext: next ? next.min - donations : 0, progress };
}
