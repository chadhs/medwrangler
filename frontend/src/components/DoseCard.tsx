import { useState } from "react";

interface DoseCardProps {
  medName: string;
  time: Date;
  isTaken: boolean;
  isOverdue: boolean;
  onToggle: (taken: boolean) => Promise<void>;
}

export function DoseCard({
  medName,
  time,
  isTaken,
  isOverdue,
  onToggle,
}: DoseCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(!isTaken);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeDisplay = () => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      const overdueMins = Math.abs(diffMinutes);
      const overdueHours = Math.abs(diffHours);
      if (overdueHours > 0) {
        return `${overdueHours}h ${overdueMins}m overdue`;
      }
      return `${overdueMins}m overdue`;
    }

    if (diffHours === 0 && diffMinutes <= 15) {
      return "Now";
    }

    if (diffHours === 0) {
      return `in ${diffMinutes}m`;
    }

    if (diffHours < 24) {
      return `in ${diffHours}h ${diffMinutes}m`;
    }

    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getCardClassName = () => {
    const baseClass = "dose-card";
    if (isTaken) return `${baseClass} taken`;
    if (isOverdue) return `${baseClass} overdue`;
    return baseClass;
  };

  return (
    <div className={getCardClassName()}>
      <div className="dose-info">
        <div className="med-name">{medName}</div>
        <div className={`dose-time ${isOverdue ? "overdue-text" : ""}`}>
          {getTimeDisplay()}
        </div>
      </div>

      <button
        className={`dose-toggle ${isTaken ? "taken" : "not-taken"} ${isLoading ? "loading" : ""}`}
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading-spinner">⏳</span>
        ) : isTaken ? (
          <span className="taken-icon">✅</span>
        ) : (
          <span className="not-taken-icon">⭕</span>
        )}
        <span className="toggle-text">
          {isTaken ? "Taken" : "Mark as Taken"}
        </span>
      </button>
    </div>
  );
}
