import { redirect } from "next/navigation";

/**
 * Direct links to /notes/[noteSetId] redirect to the all_notes grid.
 * The note viewer is a modal — opened by clicking a card in the grid.
 */
export default async function NoteSetPage({
  params,
}: {
  params: Promise<{ noteSetId: string }>;
}) {
  const { noteSetId } = await params;
  redirect(`/notes/all_notes?open=${noteSetId}`);
}
