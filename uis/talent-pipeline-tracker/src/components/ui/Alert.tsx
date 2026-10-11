interface AlertProps {
  message: string;
  variant: "success" | "error";
}

export function Alert({ message, variant }: AlertProps) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={
        isError
          ? "border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
          : "border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
      }
    >
      {message}
    </div>
  );
}