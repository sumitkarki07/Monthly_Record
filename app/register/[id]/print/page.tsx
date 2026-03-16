"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Entry = {
  id: number;
  resident_name: string;
  date: string;
  price: number;
};

type RegisterInfo = {
  id: number;
  month: number;
  year: number;
};

export default function RegisterPrintPage() {
  const params = useParams();
  const registerId = Number(params?.id);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [register, setRegister] = useState<RegisterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registerId || Number.isNaN(registerId)) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/register/${registerId}`);
        if (!res.ok) {
          throw new Error("Failed to load register entries");
        }
        const data = await res.json();
        setRegister(data.register);
        setEntries(data.entries ?? []);
      } catch (e: any) {
        setError(e.message ?? "Unable to load register");
      } finally {
        setLoading(false);
        setTimeout(() => {
          window.print();
        }, 500);
      }
    };

    load();
  }, [registerId]);

  const totals = useMemo(() => {
    const total = entries.reduce((sum, e) => sum + Number(e.price), 0);
    const fifteen = total * 0.15;
    const finalTotal = total - fifteen;
    return { total, fifteen, finalTotal };
  }, [entries]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2
    }).format(value);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 print:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="border-b border-slate-300 pb-4 mb-4">
          <div className="flex justify-between items-start gap-4 mb-4 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">Kapsalon Sonja</p>
              <p>Kabricht 11</p>
              <p>3770 Riemst</p>
              <p>Btw-nummer: BE 0710 710 486</p>
              <p>IBAN: BE97 7350 5743 9849</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-sm">
                SLG Operaties Vlaanderen NV WZC Huyse Elckerlyc
              </p>
              <p>ELK</p>
              <p>Trinellestraat 23</p>
              <p>3770 Riemst</p>
              <p>BE 0845.064.196</p>
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <div className="space-y-0.5">
              <p>Periode</p>
              <p>factuur nr 1</p>
            </div>
            <div className="text-right">
              {register && (
                <>
                  <p>
                    {new Date(
                      register.year,
                      register.month - 1,
                      1
                    ).toLocaleDateString("en-US", { month: "long" })}
                  </p>
                  <p>{register.year}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-700 text-sm">Loading register...</p>
        ) : (
          <>
            <table className="w-full border border-slate-300 text-xs mb-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-3 py-1 text-left border-b border-blue-800">
                    BEWONER
                  </th>
                  <th className="px-3 py-1 text-center border-b border-blue-800 w-32">
                    Datum
                  </th>
                  <th className="px-3 py-1 text-right border-b border-blue-800 w-24">
                    Prijs
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-2 text-center text-slate-500"
                    >
                      No entries.
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className="odd:bg-slate-50">
                      <td className="px-3 py-1 border-t border-slate-300">
                        {e.resident_name}
                      </td>
                      <td className="px-3 py-1 border-t border-slate-300 text-center">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-3 py-1 border-t border-slate-300 text-right tabular-nums">
                        {formatCurrency(Number(e.price))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-4 flex flex-col items-end text-xs space-y-1">
              <div className="flex gap-6">
                <span className="font-medium">Totaal:</span>
                <span className="font-semibold">
                  {formatCurrency(totals.total)}
                </span>
              </div>
              <div className="flex gap-6">
                <span className="font-medium">15%:</span>
                <span className="font-semibold">
                  {formatCurrency(totals.fifteen)}
                </span>
              </div>
              <div className="flex gap-6">
                <span className="font-medium">Eindtotaal:</span>
                <span className="font-semibold">
                  {formatCurrency(totals.finalTotal)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

