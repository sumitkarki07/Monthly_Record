"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LangToggle, { useLang } from "../components/langToggle";
import { t } from "../lib/translations";

const USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "admin";
const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin123";
const AUTH_KEY = "monthly-record-auth";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(AUTH_KEY);
      if (stored === "true") {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_KEY, "true");
      }
      router.push("/dashboard");
    } else {
      setError(t("login", "invalidCreds", lang));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            {t("login", "title", lang)}
          </h1>
          <LangToggle lang={lang} onChange={setLang} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("login", "username", lang)}
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("login", "password", lang)}
            </label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-pink-600 text-white font-medium py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            {t("login", "loginBtn", lang)}
          </button>
        </form>
      </div>
    </div>
  );
}
