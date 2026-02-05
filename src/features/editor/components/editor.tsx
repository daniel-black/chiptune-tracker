export function Editor({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-fit overflow-auto">
      <table className="border-collapse">{children}</table>
    </div>
  );
}
