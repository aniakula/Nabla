import { CURRICULUM_TOPICS } from "@/lib/curriculum/taxonomy";
import type { LevelBand } from "@/types/curriculum";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CourseRow = {
  id: string;
  topic_slug: string;
  level_band: LevelBand;
  subsection_slug: string;
  title: string;
  description: string | null;
  topic_name: string;
  topic_emoji: string | null;
};

export type RecentCourseRow = {
  last_viewed_at: string;
  view_count: number;
  course: CourseRow;
};

export function findSubsectionInTaxonomy(
  topicSlug: string,
  levelBand: LevelBand,
  subsectionSlug: string
) {
  const topic = CURRICULUM_TOPICS.find((t) => t.slug === topicSlug);
  if (!topic) return null;

  const subsection = topic.levels[levelBand]?.find((s) => s.slug === subsectionSlug);
  if (!subsection) return null;

  return { topic, subsection };
}

export async function recordSubsectionView(
  supabase: SupabaseClient,
  params: {
    topicSlug: string;
    levelBand: LevelBand;
    subsectionSlug: string;
  }
) {
  const match = findSubsectionInTaxonomy(
    params.topicSlug,
    params.levelBand,
    params.subsectionSlug
  );
  if (!match) {
    return { error: new Error("Subsection not found in taxonomy") };
  }

  const { topic, subsection } = match;

  const { data, error } = await supabase.rpc("record_subsection_view", {
    p_topic_slug: params.topicSlug,
    p_level_band: params.levelBand,
    p_subsection_slug: params.subsectionSlug,
    p_title: subsection.title,
    p_description: subsection.description,
    p_topic_name: topic.name,
    p_topic_emoji: topic.emoji,
  });

  if (error) return { error };
  return { courseId: data as string };
}

export const RECENT_COURSES_LIMIT = 5;

export async function getRecentCoursesForUser(
  supabase: SupabaseClient,
  userId: string,
  limit = RECENT_COURSES_LIMIT
): Promise<RecentCourseRow[]> {
  const { data, error } = await supabase
    .from("user_recent_courses")
    .select(
      `
      last_viewed_at,
      view_count,
      course:courses (
        id,
        topic_slug,
        level_band,
        subsection_slug,
        title,
        description,
        topic_name,
        topic_emoji
      )
    `
    )
    .eq("user_id", userId)
    .order("view_count", { ascending: false })
    .order("last_viewed_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data
    .filter((row) => row.course != null)
    .map((row) => ({
      last_viewed_at: row.last_viewed_at,
      view_count: row.view_count,
      course: row.course as unknown as CourseRow,
    }));
}

export function coursePath(course: CourseRow) {
  return `/learn/${course.topic_slug}/${course.level_band}/${course.subsection_slug}`;
}
