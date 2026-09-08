import type { Metadata } from "next";
import { ChinaHubContent } from "./ChinaHubContent";

export const metadata: Metadata = { title: "Автомобили из Китая" };
export const revalidate = 60;

export default function ChinaHubPage() {
  return <ChinaHubContent locale="ru" />;
}
