import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'id';

const translations = {
  en: {
    dashboard: "Dashboard",
    tours: "Tours",
    bookings: "Bookings",
    hotels: "Hotels",
    sights: "Sights",
    affiliates: "Affiliates",
    stats: "Business Stats",
    aiAdvice: "Get AI Strategic Advice",
    systemActivity: "System Activity",
    grossSales: "Gross Sales",
    netProfit: "Net Profit",
    avgBooking: "Avg. Booking Value",
    activeAssets: "Active Assets",
    recentBookings: "Recent Bookings",
    welcome: "Welcome back",
    adminOverview: "Global Business Performance Overview",
  },
  id: {
    dashboard: "Dasbor",
    tours: "Paket Tur",
    bookings: "Pemesanan",
    hotels: "Hotel",
    sights: "Objek Wisata",
    affiliates: "Afiliasi",
    stats: "Statistik Bisnis",
    aiAdvice: "Dapatkan Saran Strategis AI",
    systemActivity: "Aktivitas Sistem",
    grossSales: "Total Penjualan",
    netProfit: "Laba Bersih",
    avgBooking: "Rata-rata Pemesanan",
    activeAssets: "Aset Aktif",
    recentBookings: "Pemesanan Terbaru",
    welcome: "Selamat datang kembali",
    adminOverview: "Ikhtisar Performa Bisnis Global",
  }
};

interface I18nStore {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      t: (key) => translations[get().lang][key] || key,
    }),
    { name: 'tourops-lang' }
  )
);
