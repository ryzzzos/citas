"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { AgendaLoadingState } from "@/components/agenda/AgendaStates";

const AgendaPage = dynamic(() => import("@/components/agenda/AgendaPage"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <AgendaLoadingState />
    </div>
  ),
});

export default function DashboardAgendaRoute() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <AgendaLoadingState />
      </div>
    }>
      <AgendaPage />
    </Suspense>
  );
}
