interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label = "Progreso" }: ProgressBarProps) {
  return (
    <div className="progress-wrap" aria-label={`${label}: ${value}%`}>
      <div className="progress-label"><span>{label}</span><strong>{value}%</strong></div>
      <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}
