/** Clerk mounts only with a real publishable key, so the site boots (and builds) without keys. */
export function hasClerkKey(): boolean {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!k && k.startsWith("pk_") && !k.includes("TODO");
}
