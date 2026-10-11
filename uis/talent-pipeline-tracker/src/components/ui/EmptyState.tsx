interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  message: string;
  action?: EmptyStateAction;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <section className="border border-dashed border-line bg-surface px-6 py-10 text-center">
      <p className="text-muted">{message}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex min-h-10 items-center rounded-sm bg-brasa-700 px-4 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}