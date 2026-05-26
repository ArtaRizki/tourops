import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Shield,
  Users,
  Plane,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg" data-testid="text-brand-name">TourOps</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md">Features</a>
              <a href="#destinations" className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md">Destinations</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md">How It Works</a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/staff/login">
                <Button variant="outline" data-testid="button-staff-portal">Staff Portal</Button>
              </Link>
              <a href="#login" onClick={() => setShowRegister(false)}>
                <Button variant="outline" data-testid="button-login">Sign In</Button>
              </a>
              <a href="#login" onClick={() => setShowRegister(true)}>
                <Button data-testid="button-register">Sign Up</Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-tour.png"
            alt="Tour destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              <Plane className="h-3 w-3 mr-1" /> Professional Tour Operations
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight">
              Book Unforgettable
              <br />
              <span className="text-primary-foreground/90">Tour Experiences</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              From group adventures to custom family vacations, discover curated tours 
              with seamless booking, expert guides, and end-to-end trip management.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#login">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#destinations">
                <Button size="lg" variant="outline" className="text-white border-white/30 backdrop-blur-sm bg-white/10">
                  Explore Tours
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Free to browse</span>
              </div>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Instant booking</span>
              </div>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Full trip support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">Why Choose TourOps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete tour booking platform built for travelers and operators alike
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="hover-elevate cursor-pointer transition-all hover:border-primary/50"
              onClick={() => toast({ title: "Group Booking", description: "Our platform supports complex group hierarchies and dynamic pricing based on party size." })}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Group & Family Booking</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Book as a group leader, join existing groups via invite code, or plan a private family vacation with custom itineraries.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer transition-all hover:border-primary/50"
              onClick={() => toast({ title: "Seamless Fulfillment", description: "All suppliers are integrated. From flights to local guides, everything is confirmed automatically." })}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">End-to-End Fulfillment</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Track your booking from confirmation to completion. Airlines, hotels, transport, guides, and attractions are all managed for you.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer transition-all hover:border-primary/50"
              onClick={() => toast({ title: "Global Reach", description: "Our multi-country tour engine handles border crossings, visas, and multi-currency operations." })}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Multi-Country Tours</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Explore tours spanning multiple destinations with day-by-day itineraries, local experts, and country-level operational support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="destinations" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">Popular Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked tours to the world's most extraordinary locations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Greece", img: "/images/tour-greece.png", tours: 5 },
              { name: "Peru", img: "/images/tour-peru.png", tours: 3 },
              { name: "Japan", img: "/images/tour-japan.png", tours: 4 },
              { name: "Kenya Safari", img: "/images/tour-safari.png", tours: 2 },
            ].map((dest) => (
              <a
                key={dest.name}
                href="#login"
                className="group relative rounded-md overflow-hidden aspect-[4/3] block cursor-pointer"
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{dest.name}</h3>
                  <p className="text-white/70 text-sm">{dest.tours} tours available</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#login">
              <Button variant="outline" size="lg" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground transition-colors">
                Explore All Destinations <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to your dream vacation
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: Globe, title: "Browse Tours", desc: "Explore our curated catalog of tours worldwide" },
              { step: "2", icon: Calendar, title: "Pick a Date", desc: "Choose from available departure dates and group types" },
              { step: "3", icon: Users, title: "Book & Invite", desc: "Create a booking and invite travelers to join" },
              { step: "4", icon: Plane, title: "Travel", desc: "We handle flights, hotels, guides, and everything else" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="login" className="py-20 bg-card">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif mb-3">
              {showRegister ? "Create Account" : "Customer Sign In"}
            </h2>
            <p className="text-muted-foreground">
              {showRegister
                ? "Register to start browsing and booking tours."
                : "Log in to browse tours, manage bookings, and track your trips."}
            </p>
            {/* Tab switcher */}
            <div className="flex rounded-lg border p-1 mt-4 bg-background">
              <button
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !showRegister ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setShowRegister(false)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  showRegister ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setShowRegister(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
          {showRegister ? (
            <RegisterForm onShowLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm
              portal="customer"
              title="Sign In to Your Account"
              subtitle="Enter your customer credentials below."
              onShowRegister={() => setShowRegister(true)}
            />
          )}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Admin access?{" "}
              <Link href="/admin/login">
                <span className="text-primary underline cursor-pointer" data-testid="link-admin-login">
                  Admin Portal
                </span>
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Staff or operations?{" "}
              <Link href="/staff/login">
                <span className="text-primary underline cursor-pointer" data-testid="link-staff-login">
                  Staff Portal
                </span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">TourOps</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium tour operations and booking platform. Simplifying global travel for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; 2026 TourOps Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
