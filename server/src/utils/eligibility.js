/**
 * Donor eligibility engine (based on India's NBTC whole-blood guidelines):
 *   • age 18–65, weight ≥ 50 kg
 *   • gap since last donation: 90 days for men, 120 days for women
 */
export const GAP_DAYS = { male: 90, female: 120, other: 90 };
export const MIN_AGE = 18;
export const MAX_AGE = 65;
export const MIN_WEIGHT = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

export function ageFrom(dateOfBirth, now = new Date()) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

const yearsAgo = (years, now) => {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - years);
  return d;
};

/** Full eligibility report for one user (used by the Donor Passport). */
export function checkEligibility(user, now = new Date()) {
  const reasons = [];
  const gapDays = GAP_DAYS[user.gender] ?? 90;
  let nextEligibleDate = null;
  let daysLeft = 0;
  let progress = 1;

  if (user.lastDonationDate) {
    const last = new Date(user.lastDonationDate);
    nextEligibleDate = new Date(last.getTime() + gapDays * DAY_MS);
    const elapsed = now - last;
    progress = Math.min(1, Math.max(0, elapsed / (gapDays * DAY_MS)));
    if (nextEligibleDate > now) {
      daysLeft = Math.ceil((nextEligibleDate - now) / DAY_MS);
      reasons.push(`Recovery period: ${daysLeft} more day(s) after your last donation`);
    }
  }

  const age = ageFrom(user.dateOfBirth, now);
  if (age !== null && age < MIN_AGE) reasons.push(`Minimum age is ${MIN_AGE}`);
  if (age !== null && age > MAX_AGE) reasons.push(`Maximum age is ${MAX_AGE}`);
  if (user.weight && user.weight < MIN_WEIGHT) reasons.push(`Minimum weight is ${MIN_WEIGHT} kg`);
  if (!user.isDonor) reasons.push('You are not registered as a donor');
  if (!user.available) reasons.push('You have marked yourself as unavailable');

  return { eligible: reasons.length === 0, reasons, gapDays, nextEligibleDate, daysLeft, progress, age };
}

/**
 * The SAME rules expressed as a MongoDB filter, so the database itself
 * returns only donors who can donate today.
 */
export function eligibleDonorFilter(now = new Date()) {
  const maleCutoff = new Date(now.getTime() - GAP_DAYS.male * DAY_MS);
  const femaleCutoff = new Date(now.getTime() - GAP_DAYS.female * DAY_MS);
  return {
    isDonor: true,
    available: true,
    weight: { $gte: MIN_WEIGHT },
    dateOfBirth: { $lte: yearsAgo(MIN_AGE, now), $gte: yearsAgo(MAX_AGE + 1, now) },
    $or: [
      { lastDonationDate: null }, // never donated (null also matches a missing field)
      { gender: 'female', lastDonationDate: { $lte: femaleCutoff } },
      { gender: { $ne: 'female' }, lastDonationDate: { $lte: maleCutoff } },
    ],
  };
}
