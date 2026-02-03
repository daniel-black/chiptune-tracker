export function Editor({ children }: { children: React.ReactNode }) {
  return (
    <table className="table-fixed border-collapse border">{children}</table>
  );
}
