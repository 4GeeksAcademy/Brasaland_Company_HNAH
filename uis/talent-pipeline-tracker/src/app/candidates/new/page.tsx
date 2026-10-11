import { CandidateForm } from "@/components/candidates/CandidateForm";

export default function NewCandidatePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
      <h1 className="mb-7 mt-2 border-b border-line pb-6 font-display text-3xl font-bold text-foreground">
        Nueva candidatura
      </h1>
      <CandidateForm mode="create" />
    </main>
  );
}