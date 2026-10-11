import { CandidateEditLoader } from "@/components/candidates/CandidateEditLoader";

export const instant = false;

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidateEditLoader id={id} />;
}