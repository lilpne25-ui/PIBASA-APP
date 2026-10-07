"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
      className="rounded-lg border border-ink-600 px-4 py-2 text-sm text-steel-300 transition-colors duration-200 hover:border-signal hover:text-signal"
    >
      Salir
    </button>
  );
}
