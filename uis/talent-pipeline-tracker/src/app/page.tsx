import { Suspense } from "react";
import { CandidateListing } from "@/components/candidates/CandidateListing";
import { LoadingState } from "@/components/ui/LoadingState";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-5 py-10">
          <LoadingState />
        </main>
      }
    >
      <CandidateListing />
    </Suspense>
  );
}