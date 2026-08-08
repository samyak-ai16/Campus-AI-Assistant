import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    ai_chat: "AI Chat",
    attendance: "Attendance",
    timetable: "Timetable",
    syllabus: "Syllabus",
    faculty: "Faculty",
    notices: "Notices",
    events: "Events",
    exams: "Exams",
    profile: "Profile",
    settings: "Settings",
    admin_panel: "Admin Panel",
    sign_out: "Sign out",
    welcome_back: "Welcome back",
    search_placeholder: "Search anything… (⌘K)",
    notifications: "Notifications",
    no_notifications: "You're all caught up",
    language: "Language",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    ai_chat: "एआई चैट",
    attendance: "उपस्थिति",
    timetable: "समय सारिणी",
    syllabus: "पाठ्यक्रम",
    faculty: "शिक्षक",
    notices: "सूचनाएँ",
    events: "कार्यक्रम",
    exams: "परीक्षाएँ",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    admin_panel: "एडमिन पैनल",
    sign_out: "साइन आउट",
    welcome_back: "वापसी पर स्वागत है",
    search_placeholder: "कुछ भी खोजें… (⌘K)",
    notifications: "सूचनाएँ",
    no_notifications: "सब कुछ देख लिया गया",
    language: "भाषा",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    ai_chat: "एआय चॅट",
    attendance: "उपस्थिती",
    timetable: "वेळापत्रक",
    syllabus: "अभ्यासक्रम",
    faculty: "शिक्षक",
    notices: "सूचना",
    events: "कार्यक्रम",
    exams: "परीक्षा",
    profile: "प्रोफाइल",
    settings: "सेटिंग्ज",
    admin_panel: "अ‍ॅडमिन पॅनेल",
    sign_out: "साइन आउट",
    welcome_back: "पुन्हा स्वागत आहे",
    search_placeholder: "काहीही शोधा… (⌘K)",
    notifications: "सूचना",
    no_notifications: "सर्व सूचना पाहिल्या",
    language: "भाषा",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };

const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("campus.lang")) as Lang | null;
    if (stored && ["en", "hi", "mr"].includes(stored)) setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("campus.lang", l); } catch {}
  }

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    t: (k) => dict[lang][k] ?? dict.en[k] ?? k,
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
