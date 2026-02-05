export function Editor({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-fit overflow-auto">
      <table className="border-separate border-spacing-0">{children}</table>
    </div>
  );
}
