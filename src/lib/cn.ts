// Tiny class-name joiner. Filters falsy values so conditional classes stay
// readable without pulling in a dependency.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
