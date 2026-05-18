export type AccountRole = "student" | "instructor";

const STORAGE_KEY = "nabla_onboarding_role";

export function setPendingRole(role: AccountRole): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, role);
}

export function getPendingRole(): AccountRole | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (value === "student" || value === "instructor") return value;
  return null;
}

export function clearPendingRole(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function roleToProfileMeta(role: AccountRole) {
  if (role === "instructor") {
    return {
      can_act_as_instructor: true,
      active_mode: "student" as const,
      onboarding_completed: true,
    };
  }
  return {
    can_act_as_instructor: false,
    active_mode: "student" as const,
    onboarding_completed: true,
  };
}
