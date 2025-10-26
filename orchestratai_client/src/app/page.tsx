import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";

export default function Home(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ThreePanelLayout />
      <Footer />
    </div>
  );
}
