"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Lang, t } from "../lib/translations";

type Entry = {
  id: number;
  resident_id: number;
  resident_name: string;
  date: string;
  price: number;
};

type Suggestion = { id: number; name: string };

export default function EntryForm({
  registerId,
  onEntryCreated,
  lang = "nl"
}: {
  registerId: number;
  onEntryCreated: (entry: Entry) => void;
  lang?: Lang;
}) {
  const [residentName, setResidentName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/residents?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.residents ?? []);
          setShowSuggestions((data.residents ?? []).length > 0);
        }
      } catch {
        /* ignore */
      }
    }, 250);
  }, []);

  const handleNameChange = (value: string) => {
    setResidentName(value);
    fetchSuggestions(value);
  };

  const pickSuggestion = (name: string) => {
    setResidentName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!residentName.trim() || !date || !price) {
      setError(t("register", "fillAll", lang));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          register_id: registerId,
          resident_name: residentName.trim(),
          date,
          price: Number(price)
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to add entry");
      }
      const data = await res.json();
      onEntryCreated(data.entry);
      setResidentName("");
      setDate("");
      setPrice("");
    } catch (e: any) {
      setError(e.message ?? "Unable to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
    >
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("register", "residentName", lang)}
        </label>
        <input
          type="text"
          placeholder={lang === "nl" ? "bv. Mouha Alice" : "e.g. Mouha Alice"}
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          value={residentName}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-pink-50 hover:text-pink-700"
                  onClick={() => pickSuggestion(s.name)}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("register", "date", lang)}
        </label>
        <input
          type="date"
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("register", "priceLabel", lang)} (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className={`w-full text-white font-medium py-2 rounded-md transition-colors disabled:opacity-60 ${
            submitting
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {submitting ? t("dashboard", "saving", lang) : t("register", "addBtn", lang)}
        </button>
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
