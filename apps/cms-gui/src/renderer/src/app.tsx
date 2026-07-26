import { Dashboard } from "./components/dashboard";
import { PopoverPanel } from "./components/popover-panel";

const view = new URLSearchParams(window.location.search).get("view");

export const App = () => {
  if (view === "popover") {
    return <PopoverPanel />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard />
    </div>
  );
};
