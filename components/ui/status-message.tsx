type StatusType = "success" | "error" | "info";

const styles: Record<StatusType, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

type StatusMessageProps = {
  type?: StatusType;
  message?: string | null;
};

export default function StatusMessage({
  type = "info",
  message,
}: StatusMessageProps) {
  if (!message) return null;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}