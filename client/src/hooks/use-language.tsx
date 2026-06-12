import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "es" | "id";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  es: "Español",
  id: "Indonesia",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  id: "🇮🇩",
};

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    tours: "Tours",
    bookings: "Bookings",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    browse_tours: "Browse Tours",
    join_groups: "Join Groups",
    my_bookings: "My Bookings",
    master_data: "Master Data",
    pricing: "Pricing",
    transport: "Transport",
    rate_cards: "Rate Cards",
    affiliates: "Affiliates",
    departures: "Departures",
    leader_dashboard: "Leader Dashboard",
    leader_payments: "Leader Payments",
    manage_passengers: "Manage Passengers",
    tour_generator: "Tour Generator",
    airline_search: "Airline Search",
    flight_dashboard: "Flight Dashboard",
    editor_dashboard: "Editor Dashboard",
    builder_dashboard: "Builder Dashboard",
    supplier_dashboard: "Supplier Dashboard",
    agent_dashboard: "Agent Dashboard",
    city_dashboard: "City Dashboard",
    hotel_dashboard: "Hotel Dashboard",
    guide_dashboard: "Guide Dashboard",
    sights_dashboard: "Sights Dashboard",
    airline_dashboard: "Airline Dashboard",

    // Common
    welcome: "Welcome to TourOps",
    search: "Search",
    logout: "Logout",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    no_results: "No results found",
    language: "Language",
    close: "Close",
    submit: "Submit",
    view_details: "View Details",
    actions: "Actions",
    status: "Status",
    date: "Date",
    price: "Price",
    total: "Total",
    notes: "Notes",
    filter: "Filters",
    clear: "Clear",
    apply: "Apply",

    // Auth
    sign_in: "Sign In",
    sign_up: "Sign Up",
    sign_out: "Sign Out",
    username: "Username",
    password: "Password",
    confirm_password: "Confirm Password",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    create_account: "Create Account",
    already_have_account: "Already have an account?",
    dont_have_account: "Don't have an account?",
    sign_in_to_account: "Sign In to Your Account",
    enter_credentials: "Enter your customer credentials below.",
    register_subtitle: "Register to start browsing and booking tours.",
    customer_sign_in: "Customer Sign In",
    staff_portal: "Staff Portal",
    admin_portal: "Admin Portal",
    sign_in_to_book: "Sign In to Book",
    login_to_browse: "Log in to browse tours, manage bookings, and track your trips.",

    // Landing Page
    hero_title_1: "Book Unforgettable",
    hero_title_2: "Tour Experiences",
    hero_subtitle: "From group adventures to custom family vacations, discover curated tours with seamless booking, expert guides, and end-to-end trip management.",
    get_started: "Get Started",
    explore_tours: "Explore Tours",
    free_to_browse: "Free to browse",
    instant_booking: "Instant booking",
    full_trip_support: "Full trip support",
    why_choose: "Why Choose TourOps",
    why_choose_subtitle: "A complete tour booking platform built for travelers and operators alike",
    group_family_booking: "Group & Family Booking",
    group_family_desc: "Book as a group leader, join existing groups via invite code, or plan a private family vacation with custom itineraries.",
    end_to_end: "End-to-End Fulfillment",
    end_to_end_desc: "Track your booking from confirmation to completion. Airlines, hotels, transport, guides, and attractions are all managed for you.",
    multi_country: "Multi-Country Tours",
    multi_country_desc: "Explore tours spanning multiple destinations with day-by-day itineraries, local experts, and country-level operational support.",
    popular_destinations: "Popular Destinations",
    popular_destinations_subtitle: "Handpicked tours to the world's most extraordinary locations",
    explore_all_destinations: "Explore All Destinations",
    how_it_works: "How It Works",
    how_it_works_subtitle: "Simple steps to your dream vacation",
    step_browse: "Browse Tours",
    step_browse_desc: "Explore our curated catalog of tours worldwide",
    step_pick_date: "Pick a Date",
    step_pick_date_desc: "Choose from available departure dates and group types",
    step_book_invite: "Book & Invite",
    step_book_invite_desc: "Create a booking and invite travelers to join",
    step_travel: "Travel",
    step_travel_desc: "We handle flights, hotels, guides, and everything else",
    tours_available: "tours available",

    // Browse Tours
    explore_tours_title: "Explore Tours",
    discover_adventure: "Discover your next adventure",
    search_placeholder: "Search tours, destinations, tags...",
    no_tours_found: "No tours found",
    try_adjusting: "Try adjusting your search or filters",
    clear_all_filters: "Clear All Filters",
    have_join_code: "Have a Join Code?",
    join_group: "Join Group",
    category: "Category",
    all_categories: "All Categories",
    duration: "Duration",
    any_duration: "Any Duration",
    travel_dates: "Travel Dates",
    max_price: "Max Price",
    per_person: "/person",
    days: "days",
    contact_for_pricing: "Contact for pricing",

    // Tour Detail
    back_to_tours: "Back to Tours",
    view_brochure: "View Brochure",
    starting_from: "Starting from",
    highlights: "Highlights",
    inclusions: "Inclusions",
    exclusions: "Exclusions",
    itinerary: "Itinerary",
    available_departures: "Available Departures",
    no_departures: "No departures available at the moment",
    spots_left: "spots left",
    book_now: "Book Now",
    book_this_tour: "Book This Tour",
    booking_type: "Booking Type",
    join_public_group: "Join Public Group",
    create_leader_group: "Create Leader Group",
    private_family: "Private Family",
    group_name: "Group Name",
    party_size: "Party Size",
    confirm_booking: "Confirm Booking",
    booking_created: "Booking created successfully!",
    booking_failed: "Booking failed",
    join_existing_group: "Join an existing group:",
    child_price: "Child:",
    single_supp: "Single Supp:",
    tour_day: "Tour day",
    activities_sights: "Activities & Sights",
    party_size_including_you: "Party Size (Including you)",
    confirm_and_join: "Confirm & Join Group",
    joining_group_for: "You are joining a group for:",
    departure: "Departure:",

    // Footer
    company: "Company",
    about_us: "About Us",
    careers: "Careers",
    contact_support: "Contact Support",
    legal: "Legal",
    terms_of_service: "Terms of Service",
    privacy_policy: "Privacy Policy",
    cookie_policy: "Cookie Policy",
    connect: "Connect",
    all_rights_reserved: "All rights reserved.",

    // Categories
    adventure: "Adventure",
    cultural: "Cultural",
    beach: "Beach",
    city_break: "City Break",
    wildlife: "Wildlife",
    religious: "Religious",
    historical: "Historical",
    nature: "Nature",
    leisure: "Leisure",

    // Brochure
    create_tour_brochure: "Create Tour Brochure",
    preview: "Preview",
    edit_settings: "Edit Settings",
    print_save_pdf: "Print / Save as PDF",
    tour_selection: "Tour Selection",
    select_tour: "Select Tour",
    choose_tour: "Choose a tour...",
    custom_brochure_title: "Custom Brochure Title",
    leave_blank_tour_name: "Leave blank to use the tour name",
    brochure_template: "Brochure Template",
    tour_leader_info: "Tour Leader Info",
    upload_photo: "Upload Photo",
    leader_name: "Leader Name",
    your_name_leader: "Your name as tour leader",
    displayed_brochure_leader: "Displayed on the brochure as the group leader",
    about_this_tour: "About This Tour",
    day_by_day_itinerary: "Day-by-Day Itinerary",
    start_date: "Start Date",
    end_date: "End Date",
    price_person: "Price / Person",
    availability: "Availability",
    led_by: "Led by",
    generated_on: "Generated on",
    contact_details_bookings: "Contact us for more details and bookings",
    classic: "Classic",
    classic_desc: "Clean layout with traditional styling",
    modern: "Modern",
    modern_desc: "Bold headers with accent colors",
    elegant: "Elegant",
    elegant_desc: "Refined design with serif typography",
  },
  es: {
    // Navigation
    dashboard: "Panel",
    tours: "Tours",
    bookings: "Reservas",
    reports: "Informes",
    users: "Usuarios",
    settings: "Configuración",
    browse_tours: "Explorar Tours",
    join_groups: "Unirse a Grupos",
    my_bookings: "Mis Reservas",
    master_data: "Datos Maestros",
    pricing: "Precios",
    transport: "Transporte",
    rate_cards: "Tarifas",
    affiliates: "Afiliados",
    departures: "Salidas",
    leader_dashboard: "Panel de Líder",
    leader_payments: "Pagos de Líder",
    manage_passengers: "Gestionar Pasajeros",
    tour_generator: "Generador de Tours",
    airline_search: "Búsqueda de Vuelos",
    flight_dashboard: "Panel de Vuelos",
    editor_dashboard: "Panel de Editor",
    builder_dashboard: "Panel de Creador",
    supplier_dashboard: "Panel de Proveedor",
    agent_dashboard: "Panel de Agente",
    city_dashboard: "Panel de Ciudad",
    hotel_dashboard: "Panel de Hotel",
    guide_dashboard: "Panel de Guía",
    sights_dashboard: "Panel de Atracciones",
    airline_dashboard: "Panel de Aerolínea",

    // Common
    welcome: "Bienvenido a TourOps",
    search: "Buscar",
    logout: "Cerrar Sesión",
    confirm: "Confirmar",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    back: "Volver",
    next: "Siguiente",
    loading: "Cargando...",
    no_results: "No se encontraron resultados",
    language: "Idioma",
    close: "Cerrar",
    submit: "Enviar",
    view_details: "Ver Detalles",
    actions: "Acciones",
    status: "Estado",
    date: "Fecha",
    price: "Precio",
    total: "Total",
    notes: "Notas",
    filter: "Filtros",
    clear: "Limpiar",
    apply: "Aplicar",

    // Auth
    sign_in: "Iniciar Sesión",
    sign_up: "Registrarse",
    sign_out: "Cerrar Sesión",
    username: "Usuario",
    password: "Contraseña",
    confirm_password: "Confirmar Contraseña",
    first_name: "Nombre",
    last_name: "Apellido",
    email: "Correo Electrónico",
    create_account: "Crear Cuenta",
    already_have_account: "¿Ya tienes una cuenta?",
    dont_have_account: "¿No tienes una cuenta?",
    sign_in_to_account: "Inicia Sesión en Tu Cuenta",
    enter_credentials: "Ingresa tus credenciales de cliente.",
    register_subtitle: "Regístrate para explorar y reservar tours.",
    customer_sign_in: "Inicio de Sesión de Cliente",
    staff_portal: "Portal de Personal",
    admin_portal: "Portal de Admin",
    sign_in_to_book: "Inicia Sesión para Reservar",
    login_to_browse: "Inicia sesión para explorar tours, gestionar reservas y seguir tus viajes.",

    // Landing Page
    hero_title_1: "Reserva Experiencias",
    hero_title_2: "de Viaje Inolvidables",
    hero_subtitle: "Desde aventuras en grupo hasta vacaciones familiares personalizadas, descubre tours seleccionados con reservas fáciles, guías expertos y gestión integral del viaje.",
    get_started: "Comenzar",
    explore_tours: "Explorar Tours",
    free_to_browse: "Exploración gratuita",
    instant_booking: "Reserva instantánea",
    full_trip_support: "Soporte completo",
    why_choose: "¿Por Qué Elegir TourOps?",
    why_choose_subtitle: "Una plataforma completa de reservas de tours para viajeros y operadores",
    group_family_booking: "Reservas Grupales y Familiares",
    group_family_desc: "Reserva como líder de grupo, únete a grupos existentes con código de invitación, o planifica vacaciones familiares privadas con itinerarios personalizados.",
    end_to_end: "Gestión Integral",
    end_to_end_desc: "Sigue tu reserva desde la confirmación hasta la finalización. Aerolíneas, hoteles, transporte, guías y atracciones, todo gestionado para ti.",
    multi_country: "Tours Multi-País",
    multi_country_desc: "Explora tours que abarcan múltiples destinos con itinerarios día a día, expertos locales y soporte operativo a nivel de país.",
    popular_destinations: "Destinos Populares",
    popular_destinations_subtitle: "Tours seleccionados a los lugares más extraordinarios del mundo",
    explore_all_destinations: "Explorar Todos los Destinos",
    how_it_works: "Cómo Funciona",
    how_it_works_subtitle: "Pasos simples para tus vacaciones soñadas",
    step_browse: "Explorar Tours",
    step_browse_desc: "Explora nuestro catálogo de tours en todo el mundo",
    step_pick_date: "Elige una Fecha",
    step_pick_date_desc: "Elige entre fechas de salida y tipos de grupo disponibles",
    step_book_invite: "Reserva e Invita",
    step_book_invite_desc: "Crea una reserva e invita a viajeros a unirse",
    step_travel: "Viaja",
    step_travel_desc: "Nosotros nos encargamos de vuelos, hoteles, guías y todo lo demás",
    tours_available: "tours disponibles",

    // Browse Tours
    explore_tours_title: "Explorar Tours",
    discover_adventure: "Descubre tu próxima aventura",
    search_placeholder: "Buscar tours, destinos, etiquetas...",
    no_tours_found: "No se encontraron tours",
    try_adjusting: "Intenta ajustar tu búsqueda o filtros",
    clear_all_filters: "Limpiar Todos los Filtros",
    have_join_code: "¿Tienes un Código?",
    join_group: "Unirse al Grupo",
    category: "Categoría",
    all_categories: "Todas las Categorías",
    duration: "Duración",
    any_duration: "Cualquier Duración",
    travel_dates: "Fechas de Viaje",
    max_price: "Precio Máximo",
    per_person: "/persona",
    days: "días",
    contact_for_pricing: "Contactar para precios",

    // Tour Detail
    back_to_tours: "Volver a Tours",
    view_brochure: "Ver Folleto",
    starting_from: "Desde",
    highlights: "Destacados",
    inclusions: "Incluye",
    exclusions: "No Incluye",
    itinerary: "Itinerario",
    available_departures: "Salidas Disponibles",
    no_departures: "No hay salidas disponibles en este momento",
    spots_left: "plazas disponibles",
    book_now: "Reservar Ahora",
    book_this_tour: "Reservar Este Tour",
    booking_type: "Tipo de Reserva",
    join_public_group: "Unirse a Grupo Público",
    create_leader_group: "Crear Grupo de Líder",
    private_family: "Familia Privada",
    group_name: "Nombre del Grupo",
    party_size: "Tamaño del Grupo",
    confirm_booking: "Confirmar Reserva",
    booking_created: "¡Reserva creada exitosamente!",
    booking_failed: "La reserva falló",
    join_existing_group: "Unirse a un grupo existente:",
    child_price: "Niño:",
    single_supp: "Sup. Individual:",
    tour_day: "Día del tour",
    activities_sights: "Actividades y Atracciones",
    party_size_including_you: "Tamaño del Grupo (Incluyéndote)",
    confirm_and_join: "Confirmar y Unirse",
    joining_group_for: "Te estás uniendo a un grupo para:",
    departure: "Salida:",

    // Footer
    company: "Empresa",
    about_us: "Sobre Nosotros",
    careers: "Carreras",
    contact_support: "Contactar Soporte",
    legal: "Legal",
    terms_of_service: "Términos de Servicio",
    privacy_policy: "Política de Privacidad",
    cookie_policy: "Política de Cookies",
    connect: "Conectar",
    all_rights_reserved: "Todos los derechos reservados.",

    // Categories
    adventure: "Aventura",
    cultural: "Cultural",
    beach: "Playa",
    city_break: "Escapada Urbana",
    wildlife: "Vida Silvestre",
    religious: "Religioso",
    historical: "Histórico",
    nature: "Naturaleza",
    leisure: "Ocio",

    // Brochure
    create_tour_brochure: "Crear Folleto de Tour",
    preview: "Previsualizar",
    edit_settings: "Editar Configuración",
    print_save_pdf: "Imprimir / Guardar como PDF",
    tour_selection: "Selección de Tour",
    select_tour: "Seleccionar Tour",
    choose_tour: "Elegir un tour...",
    custom_brochure_title: "Título Personalizado del Folleto",
    leave_blank_tour_name: "Dejar en blanco para usar el nombre del tour",
    brochure_template: "Plantilla de Folleto",
    tour_leader_info: "Información del Líder del Tour",
    upload_photo: "Subir Foto",
    leader_name: "Nombre del Líder",
    your_name_leader: "Su nombre como líder del tour",
    displayed_brochure_leader: "Se muestra en el folleto como el líder del grupo",
    about_this_tour: "Sobre Este Tour",
    day_by_day_itinerary: "Itinerario Día a Día",
    start_date: "Fecha de Inicio",
    end_date: "Fecha de Finalización",
    price_person: "Precio / Persona",
    availability: "Disponibilidad",
    led_by: "Dirigido por",
    generated_on: "Generado el",
    contact_details_bookings: "Contáctenos para más detalles y reservas",
    classic: "Clásico",
    classic_desc: "Diseño limpio con estilo tradicional",
    modern: "Moderno",
    modern_desc: "Cabeceras audaces con colores de acento",
    elegant: "Elegante",
    elegant_desc: "Diseño refinado con tipografía serif",
  },
  id: {
    // Navigation
    dashboard: "Dasbor",
    tours: "Tur",
    bookings: "Pesanan",
    reports: "Laporan",
    users: "Pengguna",
    settings: "Pengaturan",
    browse_tours: "Cari Tur",
    join_groups: "Gabung Grup",
    my_bookings: "Pesanan Saya",
    master_data: "Data Master",
    pricing: "Harga",
    transport: "Transportasi",
    rate_cards: "Kartu Tarif",
    affiliates: "Afiliasi",
    departures: "Keberangkatan",
    leader_dashboard: "Dasbor Pemimpin",
    leader_payments: "Pembayaran Pemimpin",
    manage_passengers: "Kelola Penumpang",
    tour_generator: "Generator Tur AI",
    airline_search: "Cari Maskapai",
    flight_dashboard: "Dasbor Penerbangan",
    editor_dashboard: "Dasbor Editor",
    builder_dashboard: "Dasbor Pembuat",
    supplier_dashboard: "Dasbor Pemasok",
    agent_dashboard: "Dasbor Agen",
    city_dashboard: "Dasbor Kota",
    hotel_dashboard: "Dasbor Hotel",
    guide_dashboard: "Dasbor Pemandu",
    sights_dashboard: "Dasbor Atraksi",
    airline_dashboard: "Dasbor Maskapai",

    // Common
    welcome: "Selamat Datang di TourOps",
    search: "Cari",
    logout: "Keluar",
    confirm: "Konfirmasi",
    cancel: "Batal",
    save: "Simpan",
    delete: "Hapus",
    edit: "Ubah",
    create: "Buat",
    back: "Kembali",
    next: "Selanjutnya",
    loading: "Memuat...",
    no_results: "Tidak ada hasil",
    language: "Bahasa",
    close: "Tutup",
    submit: "Kirim",
    view_details: "Lihat Detail",
    actions: "Aksi",
    status: "Status",
    date: "Tanggal",
    price: "Harga",
    total: "Total",
    notes: "Catatan",
    filter: "Filter",
    clear: "Hapus",
    apply: "Terapkan",

    // Auth
    sign_in: "Masuk",
    sign_up: "Daftar",
    sign_out: "Keluar",
    username: "Nama Pengguna",
    password: "Kata Sandi",
    confirm_password: "Konfirmasi Kata Sandi",
    first_name: "Nama Depan",
    last_name: "Nama Belakang",
    email: "Email",
    create_account: "Buat Akun",
    already_have_account: "Sudah punya akun?",
    dont_have_account: "Belum punya akun?",
    sign_in_to_account: "Masuk ke Akun Anda",
    enter_credentials: "Masukkan kredensial pelanggan Anda.",
    register_subtitle: "Daftar untuk mulai menjelajahi dan memesan tur.",
    customer_sign_in: "Masuk Pelanggan",
    staff_portal: "Portal Staf",
    admin_portal: "Portal Admin",
    sign_in_to_book: "Masuk untuk Memesan",
    login_to_browse: "Masuk untuk menjelajahi tur, mengelola pesanan, dan melacak perjalanan Anda.",

    // Landing Page
    hero_title_1: "Pesan Pengalaman",
    hero_title_2: "Wisata Tak Terlupakan",
    hero_subtitle: "Dari petualangan grup hingga liburan keluarga kustom, temukan tur pilihan dengan pemesanan mudah, pemandu ahli, dan manajemen perjalanan menyeluruh.",
    get_started: "Mulai Sekarang",
    explore_tours: "Jelajahi Tur",
    free_to_browse: "Gratis untuk menjelajah",
    instant_booking: "Pemesanan instan",
    full_trip_support: "Dukungan perjalanan penuh",
    why_choose: "Mengapa Memilih TourOps",
    why_choose_subtitle: "Platform pemesanan tur lengkap untuk wisatawan dan operator",
    group_family_booking: "Pemesanan Grup & Keluarga",
    group_family_desc: "Pesan sebagai pemimpin grup, gabung grup yang ada via kode undangan, atau rencanakan liburan keluarga privat dengan itinerari kustom.",
    end_to_end: "Pengelolaan Menyeluruh",
    end_to_end_desc: "Lacak pesanan Anda dari konfirmasi hingga selesai. Maskapai, hotel, transportasi, pemandu, dan atraksi semuanya dikelola untuk Anda.",
    multi_country: "Tur Multi-Negara",
    multi_country_desc: "Jelajahi tur yang mencakup beberapa destinasi dengan itinerari harian, ahli lokal, dan dukungan operasional tingkat negara.",
    popular_destinations: "Destinasi Populer",
    popular_destinations_subtitle: "Tur pilihan ke lokasi paling luar biasa di dunia",
    explore_all_destinations: "Jelajahi Semua Destinasi",
    how_it_works: "Cara Kerja",
    how_it_works_subtitle: "Langkah sederhana menuju liburan impian Anda",
    step_browse: "Jelajahi Tur",
    step_browse_desc: "Jelajahi katalog tur kami di seluruh dunia",
    step_pick_date: "Pilih Tanggal",
    step_pick_date_desc: "Pilih dari tanggal keberangkatan dan tipe grup yang tersedia",
    step_book_invite: "Pesan & Undang",
    step_book_invite_desc: "Buat pesanan dan undang wisatawan untuk bergabung",
    step_travel: "Berwisata",
    step_travel_desc: "Kami mengurus penerbangan, hotel, pemandu, dan semuanya",
    tours_available: "tur tersedia",

    // Browse Tours
    explore_tours_title: "Jelajahi Tur",
    discover_adventure: "Temukan petualangan berikutnya",
    search_placeholder: "Cari tur, destinasi, tag...",
    no_tours_found: "Tidak ada tur ditemukan",
    try_adjusting: "Coba sesuaikan pencarian atau filter Anda",
    clear_all_filters: "Hapus Semua Filter",
    have_join_code: "Punya Kode Gabung?",
    join_group: "Gabung Grup",
    category: "Kategori",
    all_categories: "Semua Kategori",
    duration: "Durasi",
    any_duration: "Semua Durasi",
    travel_dates: "Tanggal Perjalanan",
    max_price: "Harga Maks",
    per_person: "/orang",
    days: "hari",
    contact_for_pricing: "Hubungi untuk harga",

    // Tour Detail
    back_to_tours: "Kembali ke Tur",
    view_brochure: "Lihat Brosur",
    starting_from: "Mulai dari",
    highlights: "Sorotan",
    inclusions: "Termasuk",
    exclusions: "Tidak Termasuk",
    itinerary: "Itinerari",
    available_departures: "Keberangkatan Tersedia",
    no_departures: "Tidak ada keberangkatan tersedia saat ini",
    spots_left: "tempat tersisa",
    book_now: "Pesan Sekarang",
    book_this_tour: "Pesan Tur Ini",
    booking_type: "Tipe Pesanan",
    join_public_group: "Gabung Grup Publik",
    create_leader_group: "Buat Grup Pemimpin",
    private_family: "Keluarga Privat",
    group_name: "Nama Grup",
    party_size: "Jumlah Orang",
    confirm_booking: "Konfirmasi Pesanan",
    booking_created: "Pesanan berhasil dibuat!",
    booking_failed: "Pesanan gagal",
    join_existing_group: "Gabung grup yang ada:",
    child_price: "Anak:",
    single_supp: "Tambahan Sendiri:",
    tour_day: "Hari tur",
    activities_sights: "Aktivitas & Atraksi",
    party_size_including_you: "Jumlah Peserta (Termasuk Anda)",
    confirm_and_join: "Konfirmasi & Gabung Grup",
    joining_group_for: "Anda bergabung dengan grup untuk:",
    departure: "Keberangkatan:",

    // Footer
    company: "Perusahaan",
    about_us: "Tentang Kami",
    careers: "Karir",
    contact_support: "Hubungi Dukungan",
    legal: "Hukum",
    terms_of_service: "Ketentuan Layanan",
    privacy_policy: "Kebijakan Privasi",
    cookie_policy: "Kebijakan Cookie",
    connect: "Terhubung",
    all_rights_reserved: "Hak cipta dilindungi.",

    // Categories
    adventure: "Petualangan",
    cultural: "Budaya",
    beach: "Pantai",
    city_break: "Liburan Kota",
    wildlife: "Satwa Liar",
    religious: "Keagamaan",
    historical: "Sejarah",
    nature: "Alam",
    leisure: "Santai",

    // Brochure
    create_tour_brochure: "Buat Brosur Tur",
    preview: "Pratinjau",
    edit_settings: "Ubah Pengaturan",
    print_save_pdf: "Cetak / Simpan sebagai PDF",
    tour_selection: "Pilihan Tur",
    select_tour: "Pilih Tur",
    choose_tour: "Pilih tur...",
    custom_brochure_title: "Judul Brosur Kustom",
    leave_blank_tour_name: "Kosongkan untuk menggunakan nama tur",
    brochure_template: "Templat Brosur",
    tour_leader_info: "Info Pemimpin Tur",
    upload_photo: "Unggah Foto",
    leader_name: "Nama Pemimpin",
    your_name_leader: "Nama Anda sebagai pemimpin tur",
    displayed_brochure_leader: "Ditampilkan di brosur sebagai pemimpin grup",
    about_this_tour: "Tentang Tur Ini",
    day_by_day_itinerary: "Itinerari Harian",
    start_date: "Tanggal Mulai",
    end_date: "Tanggal Selesai",
    price_person: "Harga / Orang",
    availability: "Ketersediaan",
    led_by: "Dipimpin oleh",
    generated_on: "Dibuat pada",
    contact_details_bookings: "Hubungi kami untuk detail lebih lanjut dan pemesanan",
    classic: "Klasik",
    classic_desc: "Tata letak bersih dengan gaya tradisional",
    modern: "Modern",
    modern_desc: "Header tebal dengan warna aksen",
    elegant: "Elegan",
    elegant_desc: "Desain halus dengan tipografi serif",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("tourops-language");
  if (stored === "en" || stored === "es" || stored === "id") return stored;
  // Auto-detect from browser
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === "es") return "es";
  if (browserLang === "id") return "id";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    localStorage.setItem("tourops-language", lang);
    document.documentElement.lang = lang;

    // Set translation cookie for Google Translate
    if (lang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = "googtrans=; path=/;";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }

    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.lang = language;

    // Ensure cookie matches on mount / state change
    document.cookie = `googtrans=/en/${language}; path=/`;
    document.cookie = `googtrans=/en/${language}; path=/; domain=${window.location.hostname}`;

    const triggerGoogleTranslate = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = language;
        select.dispatchEvent(new Event('change'));
        return true;
      }
      return false;
    };

    if (!triggerGoogleTranslate()) {
      let count = 0;
      const interval = setInterval(() => {
        if (triggerGoogleTranslate()) {
          clearInterval(interval);
        }
        count++;
        if (count > 20) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
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
