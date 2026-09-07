import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/data/profile";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Настройки профиля" };

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Настройки профиля</h1>
      <SettingsForm profile={currentUser.profile} />
    </div>
  );
}
