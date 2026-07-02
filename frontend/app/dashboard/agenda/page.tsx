import { Suspense } from "react";
import AgendaPage from "@/components/agenda/AgendaPage";
import { AgendaLoadingState } from "@/components/agenda/AgendaStates";

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
