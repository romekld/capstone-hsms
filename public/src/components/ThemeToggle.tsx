import { Sun } from 'lucide-react';

export function ThemeToggle() {
  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-muted">
      <div
        className="p-2 rounded-md bg-background text-foreground shadow-sm cursor-default"
        aria-label="Light mode"
      >
        <Sun className="size-4" />
      </div>
    </div>
  );
}
