import { cn } from "../../lib/utils";

interface SubheadingProps {
  className?: string;
  children: React.ReactNode;
}

export function Subheading({ className, children }: SubheadingProps) {
  return (
    <p className={cn("text-sm font-medium tracking-wide uppercase text-fg-secondary", className)}>
      {children}
    </p>
  );
}
