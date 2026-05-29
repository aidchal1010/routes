import Map from "@/components/map/Map";
import { PauseProvider } from "@/components/map/PauseContext";

export default function FrameworkPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-night-950">
      <PauseProvider>
        <Map />
      </PauseProvider>
    </main>
  );
}
