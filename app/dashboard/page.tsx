"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AUTH_KEY = "monthly-record-auth";

type Register = {
  id: number;
  month: number;
  year: number;
};

function formatMonthYear(month: number, year: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = window.localStorage.getItem(AUTH_KEY);
      if (auth !== "true") {
        router.replace("/");
        return;
      }
    }
    const load = async () => {
      try {
        const res = await fetch("/api/register");
        if (!res.ok) {
          throw new Error("Failed to load registers");
        }
        const data = await res.json();
        setRegisters(data.registers ?? []);
      } catch (e: any) {
        setError(e.message ?? "Unable to load registers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create register");
      }
      const created = await res.json();
      setRegisters((prev) =>
        [created.register, ...prev].sort((a, b) =>
          a.year === b.year ? b.month - a.month : b.year - a.year
        )
      );
    } catch (e: any) {
      setError(e.message ?? "Unable to create register");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-100 py-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Monthly Records
          </h1>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Month
            </label>
            <select
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {formatMonthYear(idx + 1, 2000).split(" ")[0]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Year
            </label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className={`w-full text-white font-medium py-2 rounded-md transition-colors disabled:opacity-60 ${
                creating
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {creating ? "Saving..." : "+ Create New Month"}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-600">Loading registers...</p>
        ) : registers.length === 0 ? (
          <p className="text-slate-600">
            No monthly records yet. Create one above to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {registers.map((reg) => (
              <li key={reg.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">
                    {formatMonthYear(reg.month, reg.year)}
                  </p>
                </div>
                <Link
                  href={`/register/${reg.id}`}
                  className="text-primary hover:text-primary-light text-sm font-medium"
                >
                  View Register
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

