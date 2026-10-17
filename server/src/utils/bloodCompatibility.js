/**
 * Red-cell compatibility rules.
 *
 * Most donor apps only search for the SAME blood group. RaktSetu searches for
 * every group the patient can SAFELY receive, which multiplies the donor pool
 * (e.g. an AB+ patient can receive from all 8 common groups).
 *
 * "hh" = Bombay blood group (≈1 in 10,000 Indians). Bombay patients can ONLY
 * receive Bombay blood, so we track it separately and never spend Bombay
 * donors on ordinary requests.
 */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'hh'];

export const BLOOD_GROUP_LABELS = {
  'A+': 'A+', 'A-': 'A−', 'B+': 'B+', 'B-': 'B−',
  'AB+': 'AB+', 'AB-': 'AB−', 'O+': 'O+', 'O-': 'O−',
  hh: 'Bombay (hh)',
};

// recipient → donor groups it can safely receive from
const RECEIVE_FROM = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
  hh: ['hh'],
};

/** Groups that can donate TO this recipient group. */
export const donorGroupsFor = (recipient) => RECEIVE_FROM[recipient] || [];

/** Groups this donor group can donate TO. */
export const recipientGroupsFor = (donor) =>
  BLOOD_GROUPS.filter((recipient) => RECEIVE_FROM[recipient].includes(donor));

export const isCompatible = (donorGroup, recipientGroup) =>
  donorGroupsFor(recipientGroup).includes(donorGroup);
