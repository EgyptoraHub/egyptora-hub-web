import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EducationHubPage, EducationError } from "@/components/education/EducationPages";
import { educationHubQuery } from "@/lib/education.functions";

const title = "Education & Schools in Egypt | Egyptora Hub";
const description = "Official Egyptian education resources: universities and programmes, learning platforms and certificate guides with official sources. موارد التعليم الرسمية في مصر.";

export const Route = createFileRoute("/education")({
  loader: ({ context }) => context.queryClient.ensureQueryData(educationHubQuery),
  head: () => simpleHead("/education", title, description, SITE.url),
  errorComponent: EducationError,
  component: EducationHubPage,
});
