export function Editor({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh min-w-fit w-fit overflow-auto">
      <table className="border-separate border-spacing-0">{children}</table>
    </div>
  );
}
