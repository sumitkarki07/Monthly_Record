type EntryRow = {
  id: number;
  resident_name: string;
  date: string;
  price: number;
  resident_id?: number;
};

type Totals = {
  total: number;
  fifteen: number;
  finalTotal: number;
};

export default function EntryTable({
  entries,
  totals,
  onDelete,
  onEdit
}: {
  entries: EntryRow[];
  totals: Totals;
  onDelete?: (id: number) => void;
  onEdit?: (entry: EntryRow) => void;
}) {
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
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-200 text-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-4 py-2 text-left font-semibold border-b border-primary-dark">
              Resident Name
            </th>
            <th className="px-4 py-2 text-center font-semibold border-b border-primary-dark">
              Date
            </th>
            <th className="px-4 py-2 text-right font-semibold border-b border-primary-dark">
              Price
            </th>
            {(onDelete || onEdit) && (
              <th className="px-4 py-2 text-center font-semibold border-b border-primary-dark">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={onDelete || onEdit ? 4 : 3}
                className="px-4 py-4 text-center text-slate-500"
              >
                No entries yet.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className="odd:bg-slate-50 even:bg-white hover:bg-slate-100"
              >
                <td className="px-4 py-2 border-t border-slate-200">
                  {entry.resident_name}
                </td>
                <td className="px-4 py-2 border-t border-slate-200 text-center">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-2 border-t border-slate-200 text-right tabular-nums">
                  {formatCurrency(Number(entry.price))}
                </td>
                {(onDelete || onEdit) && (
                  <td className="px-4 py-2 border-t border-slate-200 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="text-xs text-primary hover:text-primary-light font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(entry.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col items-end space-y-1 text-sm">
        <div className="flex justify-between gap-8">
          <span className="font-medium text-slate-700">Total:</span>
          <span className="font-semibold">{formatCurrency(totals.total)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="font-medium text-slate-700">15%:</span>
          <span className="font-semibold">{formatCurrency(totals.fifteen)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="font-medium text-slate-700">Final Total:</span>
          <span className="font-semibold">
            {formatCurrency(totals.finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

