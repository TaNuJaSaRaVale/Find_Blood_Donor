/** Mirror of server/src/utils/bloodCompatibility.js so the UI can explain matches instantly. */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'hh'];

export const groupLabel = (g) => (g === 'hh' ? 'Bombay (hh)' : g?.replace('-', '−'));

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

export const canReceiveFrom = (recipient) => RECEIVE_FROM[recipient] || [];
export const canDonateTo = (donor) => BLOOD_GROUPS.filter((r) => RECEIVE_FROM[r].includes(donor));
export const isCompatible = (donor, recipient) => canReceiveFrom(recipient).includes(donor);

export const URGENCY = {
  critical: { label: 'Critical', icon: '🚨', hint: 'Needed within hours – alerts donors up to 25 km, expires in 24 h' },
  urgent: { label: 'Urgent', icon: '⏰', hint: 'Needed within 1–3 days – alerts donors up to 15 km' },
  normal: { label: 'Planned', icon: '📅', hint: 'Planned surgery / transfusion – alerts donors up to 10 km' },
};
