export function EditorBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&>tr:nth-child(4n)]:bg-gray-100">{children}</tbody>;
}
