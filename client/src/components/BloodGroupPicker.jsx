import { BLOOD_GROUPS, groupLabel } from '../utils/blood';

/** A grid of blood-drop buttons instead of a boring <select>. */
export default function BloodGroupPicker({ value, onChange, highlight = [] }) {
  return (
    <div className="group-picker" role="radiogroup">
      {BLOOD_GROUPS.map((g) => (
        <button
          type="button"
          key={g}
          role="radio"
          aria-checked={value === g}
          className={`group-picker__item ${value === g ? 'is-active' : ''} ${highlight.includes(g) && value !== g ? 'is-compatible' : ''} ${g === 'hh' ? 'is-rare' : ''}`}
          onClick={() => onChange(g)}
          title={g === 'hh' ? 'Bombay blood group - very rare, can only receive Bombay blood' : groupLabel(g)}
        >
          {groupLabel(g)}
        </button>
      ))}
    </div>
  );
}
