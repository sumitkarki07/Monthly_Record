"use client";

import { FormEvent, useState } from "react";

type Entry = {
  id: number;
  resident_id: number;
  resident_name: string;
  date: string;
  price: number;
};

export default function EntryForm({
  registerId,
  onEntryCreated
}: {
  registerId: number;
  onEntryCreated: (entry: Entry) => void;
}) {
  const [residentName, setResidentName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!residentName.trim() || !date || !price) {
      setError("Please fill in all fields.");
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Resident Name
        </label>
        <input
          type="text"
          placeholder="e.g. Mouha Alice"
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          value={residentName}
          onChange={(e) => setResidentName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Date
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
          Price (€)
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
          {submitting ? "Saving..." : "Add Entry"}
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

