import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "id";

const translations = {
  en: {
    dashboard: "Dashboard",
    tours: "Tours",
    bookings: "Bookings",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    browse_tours: "Browse Tours",
    join_groups: "Join Groups",
    my_bookings: "My Bookings",
    welcome: "Welcome to TourOps",
    search: "Search",
    logout: "Logout",
    confirm: "Confirm",
    cancel: "Cancel",
  },
  id: {
    dashboard: "Dasbor",
    tours: "Tur",
    bookings: "Pesanan",
    reports: "Laporan",
    users: "Pengguna",
    settings: "Pengaturan",
    browse_tours: "Cari Tur",
    join_groups: "Gabung Grup",
    my_bookings: "Pesanan Saya",
    welcome: "Selamat Datang di TourOps",
    search: "Cari",
    logout: "Keluar",
    confirm: "Konfirmasi",
    cancel: "Batal",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
