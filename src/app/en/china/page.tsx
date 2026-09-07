import type { Metadata } from "next";
import { ChinaHubContent } from "@/app/china/ChinaHubContent";

export const metadata: Metadata = { title: "Cars from China" };

export default function ChinaHubPageEn() {
  return <ChinaHubContent locale="en" />;
}
