import TopBar from "@/components/ui/TopBar";
import BuildGuide from "@/components/build-guide/BuildGuide";

// Build Guide route: a separate, scrollable document page. Deliberately NOT the world
// page's fixed/overflow-hidden layout — the bar stays put (flex child) while the content
// region scrolls. No PauseProvider here: nothing on this route touches the pause context.
export default function BuildGuidePage() {
  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-night-950">
      <TopBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <BuildGuide />
      </div>
    </main>
  );
}
