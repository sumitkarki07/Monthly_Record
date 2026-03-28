export type Lang = "nl" | "en";

const translations = {
  login: {
    title: { en: "Monthly Billing Record System", nl: "Maandelijks Facturatiesysteem" },
    username: { en: "Username", nl: "Gebruikersnaam" },
    password: { en: "Password", nl: "Wachtwoord" },
    loginBtn: { en: "Login", nl: "Inloggen" },
    invalidCreds: { en: "Invalid credentials. Please try again.", nl: "Ongeldige inloggegevens. Probeer opnieuw." }
  },
  dashboard: {
    title: { en: "Monthly Records", nl: "Maandelijkse Overzichten" },
    month: { en: "Month", nl: "Maand" },
    year: { en: "Year", nl: "Jaar" },
    createBtn: { en: "+ Create New Month", nl: "+ Nieuwe Maand Aanmaken" },
    saving: { en: "Saving...", nl: "Opslaan..." },
    loading: { en: "Loading registers...", nl: "Overzichten laden..." },
    noRecords: { en: "No monthly records yet. Create one above to get started.", nl: "Nog geen maandelijkse overzichten. Maak er hierboven een aan." },
    viewRegister: { en: "View Register", nl: "Bekijk Overzicht" },
    duplicateMonth: { en: "A register for this month and year already exists.", nl: "Er bestaat al een overzicht voor deze maand en dit jaar." }
  },
  register: {
    backToDashboard: { en: "Back to Dashboard", nl: "Terug naar Dashboard" },
    previewPrint: { en: "Preview / Print & Download", nl: "Voorbeeld / Afdrukken & Downloaden" },
    periode: { en: "Period", nl: "Periode" },
    factuur: { en: "invoice nr 1", nl: "factuur nr 1" },
    loading: { en: "Loading register...", nl: "Overzicht laden..." },
    editEntry: { en: "Edit Entry", nl: "Item Bewerken" },
    addEntry: { en: "Add Entry", nl: "Item Toevoegen" },
    residentName: { en: "Resident Name", nl: "Bewoner Naam" },
    date: { en: "Date", nl: "Datum" },
    priceLabel: { en: "Price", nl: "Prijs" },
    saveChanges: { en: "Save Changes", nl: "Opslaan" },
    cancel: { en: "Cancel", nl: "Annuleren" },
    addBtn: { en: "Add Entry", nl: "Toevoegen" },
    fillAll: { en: "Please fill in all fields.", nl: "Vul alle velden in." },
    fillAllEdit: { en: "Please fill in all fields for the edit.", nl: "Vul alle velden in om te bewerken." },
    deleteConfirm: { en: "Delete this entry?", nl: "Dit item verwijderen?" }
  },
  table: {
    residentName: { en: "Resident Name", nl: "Bewoner" },
    date: { en: "Date", nl: "Datum" },
    price: { en: "Price", nl: "Prijs" },
    actions: { en: "Actions", nl: "Acties" },
    noEntries: { en: "No entries yet.", nl: "Nog geen items." },
    edit: { en: "Edit", nl: "Bewerken" },
    delete: { en: "Delete", nl: "Verwijderen" },
    total: { en: "Total", nl: "Totaal" },
    fifteen: { en: "15%", nl: "15%" },
    finalTotal: { en: "Final Total", nl: "Eindtotaal" }
  }
} as const;

export function t(
  section: keyof typeof translations,
  key: string,
  lang: Lang
): string {
  const sec = translations[section] as Record<string, Record<Lang, string>>;
  return sec?.[key]?.[lang] ?? key;
}

const LANG_KEY = "monthly-record-lang";

export function getSavedLang(): Lang {
  if (typeof window === "undefined") return "nl";
  return (window.localStorage.getItem(LANG_KEY) as Lang) || "nl";
}

export function saveLang(lang: Lang) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANG_KEY, lang);
  }
}
