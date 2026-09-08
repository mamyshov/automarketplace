import type { Metadata } from "next";
import { HomeContent } from "@/app/HomeContent";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = { title: SITE_NAME, description: SITE_DESCRIPTION };
export const revalidate = 60;

export default function HomePageEn() {
  return <HomeContent locale="en" />;
}
