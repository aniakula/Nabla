import { findSubsectionInTaxonomy, recordSubsectionView } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import type { LevelBand } from "@/types/curriculum";
import { NextResponse } from "next/server";

const LEVEL_BANDS: LevelBand[] = [
  "elementary",
  "middle_school",
  "high_school",
  "advanced",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topicSlug, levelBand, subsectionSlug } = body as {
    topicSlug?: string;
    levelBand?: string;
    subsectionSlug?: string;
  };

  if (
    !topicSlug ||
    !subsectionSlug ||
    !levelBand ||
    !LEVEL_BANDS.includes(levelBand as LevelBand)
  ) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (
    !findSubsectionInTaxonomy(topicSlug, levelBand as LevelBand, subsectionSlug)
  ) {
    return NextResponse.json({ error: "Subsection not found" }, { status: 404 });
  }

  const { courseId, error } = await recordSubsectionView(supabase, {
    topicSlug,
    levelBand: levelBand as LevelBand,
    subsectionSlug,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Failed to record view" },
      { status: 500 }
    );
  }

  return NextResponse.json({ courseId });
}
