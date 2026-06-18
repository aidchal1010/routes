import { PauseProvider } from "@/components/map/PauseContext";
import SandboxShell from "@/components/sandbox/SandboxShell";

// Sandbox route: build-and-watch. Like the world route, it needs the pause context (the F.2
// motion runs here during Play), so it wraps the shell in PauseProvider. Build/Play/Stop/
// Restart live in the shell.
export default function SandboxPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-night-950">
      <PauseProvider>
        <SandboxShell />
      </PauseProvider>
    </main>
  );
}
