"use client";

import { Lang, getSavedLang, saveLang } from "../lib/translations";
import { useEffect, useState } from "react";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("nl");

  useEffect(() => {
    setLang(getSavedLang());
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    saveLang(l);
  };

  return [lang, changeLang];
}

export default function LangToggle({
  lang,
  onChange
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-200 rounded-full p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => onChange("nl")}
        className={`px-3 py-1 rounded-full transition-colors ${
          lang === "nl"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-1 rounded-full transition-colors ${
          lang === "en"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
