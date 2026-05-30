import { AppShell } from "@/components/app-shell";
import { WritePracticeForm } from "@/components/write-practice-form";
import { requireOnboardedUser } from "@/lib/auth";
import { userProfile } from "@/lib/mock-data";
import { formatBandValue } from "@/lib/profile";
import { submitWritingPractice } from "@/app/write/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

type WritePageProps = {
  searchParams?: Promise<{
    message?: string;
    type?: string;
  }>;
};

export default async function WritePage({ searchParams }: WritePageProps) {
  const params = await searchParams;
  const { profile } = await requireOnboardedUser("/write");

  return (
    <AppShell>
      <WritePracticeForm
        examDate={profile.exam_date ?? userProfile.examDate}
        initialStatusMessage={params?.message}
        initialStatusType={params?.type === "success" ? "success" : "error"}
        submitAction={submitWritingPractice}
        targetBand={formatBandValue(profile.target_band)}
      />
    </AppShell>
  );
}
