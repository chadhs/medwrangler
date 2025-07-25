import { ReactNode } from "react";

interface TimeSectionProps {
  title: string;
  count: number;
  children: ReactNode;
}

export function TimeSection({ title, count, children }: TimeSectionProps) {
  if (count === 0) return null;

  return (
    <div className="time-section">
      <h3 className="section-title">
        {title} <span className="dose-count">({count})</span>
      </h3>
      <div className="dose-grid">{children}</div>
    </div>
  );
}
