"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EntryTable from "../../../components/table";
import EntryForm from "../../../components/entryForm";
import LangToggle, { useLang } from "../../../components/langToggle";
import { t, Lang } from "../../../lib/translations";

const AUTH_KEY = "monthly-record-auth";

type Entry = {
  id: number;
  resident_id: number;
  resident_name: string;
  date: string;
  price: number;
};

type RegisterInfo = {
  id: number;
  month: number;
  year: number;
};

type Suggestion = { id: number; name: string };

function monthLabel(month: number, lang: Lang) {
  const locale = lang === "nl" ? "nl-NL" : "en-US";
  return new Date(2000, month - 1, 1).toLocaleDateString(locale, { month: "long" });
}

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const registerId = Number(params?.id);
  const [lang, setLang] = useLang();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [register, setRegister] = useState<RegisterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingResidentName, setEditingResidentName] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [editSuggestions, setEditSuggestions] = useState<Suggestion[]>([]);
  const [showEditSuggestions, setShowEditSuggestions] = useState(false);
  const editDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editWrapperRef.current && !editWrapperRef.current.contains(e.target as Node)) {
        setShowEditSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEditSuggestions = useCallback((q: string) => {
    if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
    if (q.trim().length === 0) {
      setEditSuggestions([]);
      setShowEditSuggestions(false);
      return;
    }
    editDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/residents?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setEditSuggestions(data.residents ?? []);
          setShowEditSuggestions((data.residents ?? []).length > 0);
        }
      } catch { /* ignore */ }
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = window.localStorage.getItem(AUTH_KEY);
      if (auth !== "true") {
        router.replace("/");
        return;
      }
    }

    if (!registerId || Number.isNaN(registerId)) return;

    const load = async () => {
      try {
        const registerRes = await fetch(`/api/register/${registerId}`);
        if (!registerRes.ok) throw new Error("Failed to load register entries");
        const registerData = await registerRes.json();
        setRegister(registerData.register);
        setEntries(registerData.entries ?? []);
      } catch (e: any) {
        setError(e.message ?? "Unable to load register");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [registerId, router]);

  const totals = useMemo(() => {
    const total = entries.reduce((sum, e) => sum + Number(e.price), 0);
    const fifteen = total * 0.15;
    const finalTotal = total - fifteen;
    return { total, fifteen, finalTotal };
  }, [entries]);

  const handleEntryAdded = (entry: Entry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(t("register", "deleteConfirm", lang));
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/entry/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to delete entry");
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) {
      setError(e.message ?? "Unable to delete entry");
    }
  };

  const startEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setEditingResidentName(entry.resident_name);
    setEditingDate(entry.date.slice(0, 10));
    setEditingPrice(String(entry.price));
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditingResidentName("");
    setEditingDate("");
    setEditingPrice("");
    setEditSuggestions([]);
    setShowEditSuggestions(false);
  };

  const saveEdit = async () => {
    if (!editingEntry) return;
    if (!editingResidentName.trim() || !editingDate || !editingPrice) {
      setError(t("register", "fillAllEdit", lang));
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/entry/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resident_name: editingResidentName.trim(),
          date: editingDate,
          price: Number(editingPrice)
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to update entry");
      }
      const data = await res.json();
      const updated = data.entry as Entry;
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      cancelEdit();
    } catch (e: any) {
      setError(e.message ?? "Unable to update entry");
    } finally {
      setSavingEdit(false);
    }
  };

  if (!registerId || Number.isNaN(registerId)) {
    return <p className="p-6">Invalid register ID.</p>;
  }

  const openPrintView = () => {
    window.open(`/register/${registerId}/print`, "_blank");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-100 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-8">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <div className="flex items-center justify-end mb-3">
            <LangToggle lang={lang} onChange={setLang} />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div className="text-xs text-slate-700 space-y-0.5">
              <p className="font-semibold text-sm">Kapsalon Sonja</p>
              <p>Kabricht 11</p>
              <p>3770 Riemst</p>
              <p>Btw-nummer: BE 0710 710 486</p>
              <p>IBAN: BE97 7350 5743 9849</p>
            </div>
            <div className="text-xs text-slate-700 space-y-0.5 text-right">
              <p className="font-semibold text-sm">
                SLG Operaties Vlaanderen NV WZC Huyse Elckerlyc
              </p>
              <p>ELK</p>
              <p>Trinellestraat 23</p>
              <p>3770 Riemst</p>
              <p>BE 0845.064.196</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-slate-700 space-y-0.5">
              <p>{t("register", "periode", lang)}</p>
              <p>{t("register", "factuur", lang)}</p>
            </div>
            <div className="text-xs text-slate-700 text-right">
              {register && (
                <>
                  <p>{monthLabel(register.month, lang)}</p>
                  <p>{register.year}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              ← {t("register", "backToDashboard", lang)}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openPrintView}
                className="text-sm bg-pink-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-pink-700"
              >
                {t("register", "previewPrint", lang)}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-600">{t("register", "loading", lang)}</p>
        ) : (
          <>
            <EntryTable
              entries={entries}
              totals={totals}
              onDelete={handleDelete}
              onEdit={startEdit}
              lang={lang}
            />

            {editingEntry && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  {t("register", "editEntry", lang)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 relative" ref={editWrapperRef}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t("register", "residentName", lang)}
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      value={editingResidentName}
                      onChange={(e) => {
                        setEditingResidentName(e.target.value);
                        fetchEditSuggestions(e.target.value);
                      }}
                      onFocus={() => { if (editSuggestions.length > 0) setShowEditSuggestions(true); }}
                      autoComplete="off"
                    />
                    {showEditSuggestions && editSuggestions.length > 0 && (
                      <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {editSuggestions.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-pink-50 hover:text-pink-700"
                              onClick={() => {
                                setEditingResidentName(s.name);
                                setShowEditSuggestions(false);
                              }}
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
                      value={editingDate}
                      onChange={(e) => setEditingDate(e.target.value)}
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
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className={`flex-1 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-60 ${
                        savingEdit
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-pink-600 hover:bg-pink-700"
                      }`}
                    >
                      {savingEdit ? t("dashboard", "saving", lang) : t("register", "saveChanges", lang)}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      {t("register", "cancel", lang)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {t("register", "addEntry", lang)}
              </h2>
              <EntryForm
                registerId={registerId}
                onEntryCreated={handleEntryAdded}
                lang={lang}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
