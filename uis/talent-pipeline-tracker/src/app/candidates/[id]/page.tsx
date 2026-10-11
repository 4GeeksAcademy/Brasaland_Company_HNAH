import { CandidateDetail } from "@/components/candidates/CandidateDetail";

export const instant = false;

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getReturnTo(value: string | string[] | undefined): string {
  if (value === "/") return "/";
  if (
    typeof value !== "string" ||
    !value.startsWith("/?") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  try {
    const url = new URL(value, "https://talent-pipeline.local");
    return url.origin === "https://talent-pipeline.local" && url.pathname === "/"
      ? `${url.pathname}${url.search}`
      : "/";
  } catch {
    return "/";
  }
}

// En Next.js 16, params es una promesa en Server Components y se resuelve con await.
export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const from = getReturnTo(query.from);
  const notice =
    query.created === "1" ? "created" : query.updated === "1" ? "updated" : null;

  return <CandidateDetail id={routeParams.id} returnTo={from} notice={notice} />;
}