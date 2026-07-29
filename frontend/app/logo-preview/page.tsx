import type { Metadata } from "next";
import BrandLogoShowcasePage from "@/components/brand/BrandLogoShowcasePage";

export const metadata: Metadata = {
  title: "Visualizador de Logo & Marca | AgendaWeb",
  description: "Canvas interactivo para inspeccionar y probar las variantes y tamaños del logotipo oficial de AgendaWeb.",
};

export default function LogoPreviewPage() {
  return <BrandLogoShowcasePage />;
}
