import type { Metadata } from "next";
import { loadDemoData } from "@/application/demo/load-demo-data";
import { DemoExperience } from "@/components/demo/demo-experience";
import { getPublicCatalog } from "@/infrastructure/container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demo guiada | Pibasa x VLUX",
  description: "Recorrido narrado por el catalogo tecnico real y la simulacion del cotizador, el seguimiento y la vista del dueno.",
  robots: { index: false, follow: false }
};

export default async function DemoPage() {
  const data = await loadDemoData(getPublicCatalog());
  return <DemoExperience data={data} />;
}
