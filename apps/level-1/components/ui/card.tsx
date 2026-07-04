import { cn } from "../../lib/utils";
import { Subheading } from "./subheading";

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated border border-border rounded-xl p-6",
        className
      )}
    >
      {title && (
        <div className="mb-4">
          <Subheading>{title}</Subheading>
        </div>
      )}
      {children}
    </div>
  );
}
