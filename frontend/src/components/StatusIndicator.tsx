interface StatusIndicatorProps {
  type: "success" | "warning" | "info";
  message: string;
  onDismiss?: () => void;
}

export function StatusIndicator({
  type,
  message,
  onDismiss,
}: StatusIndicatorProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`status-indicator ${type}`}>
      <span className="status-icon">{getIcon()}</span>
      <span className="status-message">{message}</span>
      {onDismiss && (
        <button className="dismiss-btn" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
