import { useState } from "react";
import {
  Palette,
  Zap,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  Sparkles,
  Package,
} from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

/**
 * Ọjà — Multi-tenant E-commerce Platform Demo
 *
 * Personal portfolio project showcasing:
 * • Multi-tenancy (subdomains, tenant-owned data)
 * • HTTP-only cookie sessions + revocation
 * • Role-based permissions / groups
 * • Visual storefront designer (drag-and-drop style)
 * • Product / variant / inventory management
 *
 * Not implemented: payments, password recovery, full settings panel
 */
export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleReachOut = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent("Portfolio Inquiry / Reach Out");
    const body = encodeURIComponent(
      email
        ? `Hi,\n\nI’d like to reach out. My email: ${email}`
        : "Hi,\n\nI’d like to reach out.",
    );

    window.location.href = `mailto:biteatertest@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src={import.meta.env.VITE_APP_LOGO}
                alt="Oja Logo"
                className="h-24 w-24"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900"
              >
                How It Works
              </a>
              <a
                href={import.meta.env.VITE_MAIN_APP_URL}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try it out
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>
                Multi-tenant • Visual builder • TypeScript • Python • Postgresql
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Ọjà
              <br />
              <span className="text-blue-600">Modern E-commerce Engine</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              A full-stack portfolio project built to explore multi-tenancy,
              session-based auth, permissions, and a custom visual storefront
              designer — with frontends built with React and TypeScript and the
              backend built with Python and FastAPI.
            </p>

            {/* CTA Form to reach out */}
            <form onSubmit={handleReachOut} className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  Reach Out
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Hero Carousel */}
          <HeroCarousel />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Core Technical Highlights
            </h2>
            <p className="text-xl text-gray-600">
              What I focused on building in this project
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multi-Tenancy
              </h3>
              <p className="text-gray-600">
                Each tenant gets isolated data, custom subdomains, storefronts,
                products and users.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Sessions
              </h3>
              <p className="text-gray-600">
                HTTP-only cookies, automatic expiration, logout revocation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Visual Designer
              </h3>
              <p className="text-gray-600">
                Custom storefront builder with live preview — no external page
                builders used.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Responsive & Fast
              </h3>
              <p className="text-gray-600">
                Mobile-first rendering, image optimization, clean component
                structure.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Product Engine
              </h3>
              <p className="text-gray-600">
                Variants, SKUs, inventory, bulk operations — tenant-scoped.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Permissions System
              </h3>
              <p className="text-gray-600">
                Group-based roles, user management (add/remove from groups).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quick Demo Flow
            </h2>
            <p className="text-xl text-gray-600">
              How the system is structured
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Tenant
              </h3>
              <p className="text-gray-600">
                Sign up → automatically gets isolated workspace + subdomain-like
                routing.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Design Storefront
              </h3>
              <p className="text-gray-600">
                Use the visual editor to build and preview the tenant's
                public-facing store.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Content
              </h3>
              <p className="text-gray-600">
                Add products, variants, assign users/roles — everything stays
                tenant-scoped.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href={import.meta.env.VITE_MAIN_APP_URL}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Open Live Demo
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Interested in the code or architecture?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Built with TypeScript, modern auth patterns, and a focus on clean
            multi-tenant isolation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={import.meta.env.VITE_MAIN_APP_URL}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg inline-flex items-center gap-2"
            >
              Try the Demo
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/akinolaemmanuel49/oja"
              className="text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-medium text-lg"
            >
              View Source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            Ọjà — Personal full-stack portfolio project •{" "}
            {new Date().getFullYear()}
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Focused on multi-tenancy, secure sessions, permissions, visual
            builder.
          </p>
        </div>
      </footer>
    </div>
  );
}
