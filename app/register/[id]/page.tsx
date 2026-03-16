"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EntryTable from "../../../components/table";
import EntryForm from "../../../components/entryForm";

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

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const registerId = Number(params?.id);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [register, setRegister] = useState<RegisterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingResidentName, setEditingResidentName] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

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

        if (!registerRes.ok) {
          throw new Error("Failed to load register entries");
        }
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
    const confirmed = window.confirm("Delete this entry?");
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
  };

  const saveEdit = async () => {
    if (!editingEntry) return;
    if (!editingResidentName.trim() || !editingDate || !editingPrice) {
      setError("Please fill in all fields for the edit.");
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
      setEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
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
              <p>Periode</p>
              <p>factuur nr 1</p>
            </div>
            <div className="text-xs text-slate-700 text-right">
              {register && (
                <>
                  <p>
                    {new Date(
                      register.year,
                      register.month - 1,
                      1
                    ).toLocaleDateString("en-US", {
                      month: "long"
                    })}
                  </p>
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
              ← Back to Dashboard
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openPrintView}
                className="text-sm bg-pink-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-pink-700"
              >
                Preview / Print & Download
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
          <p className="text-slate-600">Loading register...</p>
        ) : (
          <>
            <EntryTable
              entries={entries}
              totals={totals}
              onDelete={handleDelete}
              onEdit={startEdit}
            />

            {editingEntry && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Edit Entry
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resident Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      value={editingResidentName}
                      onChange={(e) => setEditingResidentName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date
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
                      Price (€)
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
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Add Entry
              </h2>
              <EntryForm
                registerId={registerId}
                onEntryCreated={handleEntryAdded}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

