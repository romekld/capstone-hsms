import { Outlet } from "react-router-dom";

// TODO: Full AppShell with sidebar-07 navigation built in Task 3 (02-05b)
export function AppShell() {
  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
