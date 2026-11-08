export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col shrink-0 w-[clamp(20rem,30vw,28rem)] h-dvh border-l bg-background">
      {children}
    </div>
  );
}
