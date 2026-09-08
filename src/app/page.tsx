import { HomeContent } from "./HomeContent";

// No per-user data on this page (Header's auth check is client-side — see
// HeaderAuthButton), so it can be cached and regenerated periodically
// instead of hitting Supabase on every single visit.
export const revalidate = 60;

export default function HomePage() {
  return <HomeContent locale="ru" />;
}
