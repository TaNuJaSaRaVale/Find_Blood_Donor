/** Circular countdown showing how close a donor is to being eligible again. */
export default function EligibilityRing({ eligibility }) {
  const { eligible, daysLeft, progress } = eligibility;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  return (
    <div className={`ring ${eligible ? 'ring--ok' : ''}`}>
      <svg viewBox="0 0 120 120" width="140" height="140">
        <circle cx="60" cy="60" r={r} className="ring__track" />
        <circle
          cx="60" cy="60" r={r}
          className="ring__value"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring__label">
        {eligible ? (
          <><strong>✓</strong><span>Ready to donate</span></>
        ) : daysLeft > 0 ? (
          <><strong>{daysLeft}</strong><span>days to go</span></>
        ) : (
          <><strong>✕</strong><span>Not eligible</span></>
        )}
      </div>
    </div>
  );
}
