import type { Metadata } from "next";
import { ChinaHubContent } from "@/app/china/ChinaHubContent";

export const metadata: Metadata = { title: "Cars from China" };
export const revalidate = 60;

export default function ChinaHubPageEn() {
  return <ChinaHubContent locale="en" />;
}
