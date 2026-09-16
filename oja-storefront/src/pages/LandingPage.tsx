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
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const features = [
  { icon: Globe, title: "Multi-Tenancy", desc: "Each tenant gets isolated data, custom subdomains, storefronts, products and users.", color: "blue" },
  { icon: Shield, title: "Secure Sessions", desc: "HTTP-only cookies, automatic expiration, logout revocation.", color: "purple" },
  { icon: Palette, title: "Visual Designer", desc: "Custom storefront builder with live preview — no external page builders used.", color: "indigo" },
  { icon: Smartphone, title: "Responsive & Fast", desc: "Mobile-first rendering, image optimization, clean component structure.", color: "green" },
  { icon: Package, title: "Product Engine", desc: "Variants, SKUs, inventory, bulk operations — tenant-scoped.", color: "orange" },
  { icon: Zap, title: "Permissions System", desc: "Group-based roles, user management (add/remove from groups).", color: "red" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  indigo: "bg-indigo-100 text-indigo-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

const steps = [
  { num: "1", title: "Create Tenant", desc: "Sign up → automatically gets isolated workspace + subdomain-like routing." },
  { num: "2", title: "Design Storefront", desc: "Use the visual editor to build and preview the tenant's public-facing store." },
  { num: "3", title: "Manage Content", desc: "Add products, variants, assign users/roles — everything stays tenant-scoped." },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
} as const;

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleReachOut = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent("Portfolio Inquiry / Reach Out");
    const body = encodeURIComponent(
      email ? `Hi,\n\nI'd like to reach out. My email: ${email}` : "Hi,\n\nI'd like to reach out.",
    );
    window.location.href = `mailto:biteatertest@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src={import.meta.env.VITE_APP_LOGO} alt="Oja Logo" className="h-24 w-24" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <motion.a
                href={import.meta.env.VITE_MAIN_APP_URL}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try it out
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 25, stiffness: 300 }}
              className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>Multi-tenant &bull; Visual builder &bull; TypeScript &bull; Python &bull; PostgreSQL</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 25, stiffness: 300 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              Ọjà
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Modern E-commerce Engine</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
              A full-stack portfolio project built to explore multi-tenancy, session-based auth, permissions, and a custom visual storefront designer — with frontends built with React and TypeScript and the backend built with Python and FastAPI.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", damping: 25, stiffness: 300 }}
              onSubmit={handleReachOut}
              className="max-w-md mx-auto mb-8"
            >
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  Reach Out
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.form>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", damping: 25, stiffness: 200 }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <Section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Core Technical Highlights</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600">What I focused on building in this project</motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { type: "spring", damping: 20, stiffness: 300 } }}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-shadow"
              >
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Quick Demo Flow</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600">How the system is structured</motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                >
                  {s.num}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center mt-12">
            <motion.a
              href={import.meta.env.VITE_MAIN_APP_URL}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Open Live Demo
              <ArrowRight className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-20 bg-linear-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white mb-4">Interested in the code or architecture?</motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-blue-100 mb-8">Built with TypeScript, modern auth patterns, and a focus on clean multi-tenant isolation.</motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href={import.meta.env.VITE_MAIN_APP_URL}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg inline-flex items-center gap-2"
            >
              Try the Demo
              <ArrowRight className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="https://github.com/akinolaemmanuel49/oja"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-medium text-lg"
            >
              View Source on GitHub
            </motion.a>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">Ọjà — Personal full-stack portfolio project &bull; {new Date().getFullYear()}</p>
          <p className="text-sm mt-2 text-gray-500">Focused on multi-tenancy, secure sessions, permissions, visual builder.</p>
        </div>
      </footer>
    </div>
  );
}
