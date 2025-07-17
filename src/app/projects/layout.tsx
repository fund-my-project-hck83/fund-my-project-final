import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={<LoadingSpinner message="Loading project information..." />}
    >
      {children}
    </Suspense>
  );
}
