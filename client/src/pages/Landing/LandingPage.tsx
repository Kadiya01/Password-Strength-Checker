import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  BarChart3,
  Cpu,
  ChevronDown,
  ArrowRight,
  Fingerprint,
  Zap,
  Globe,
  Quote,
  ShieldAlert
} from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: Shield,
    title: "Password Strength Checker",
    desc: "Real-time, local cryptographic entropy evaluation based on character sets and structural complexity.",
    path: "/password-checker"
  },
  {
    icon: Key,
    title: "Secure Password Generator",
    desc: "Generate highly secure, customizable, and random passwords or passphrases with client-side entropy controls.",
    path: "/password-generator"
  },
  {
    icon: Lock,
    title: "Robust User Authentication",
    desc: "Secured by JWT sessions, route authorization guards, and strict credential formatting checklist policies.",
    path: "/register"
  },
  {
    icon: BarChart3,
    title: "Security Dashboard",
    desc: "Analyze password score distributions, audit your recent evaluations, and inspect credential security levels.",
    path: "/dashboard"
  }
];

const stats = [
  { value: "482K+", label: "Passwords Evaluated" },
  { value: "310K+", label: "Strong Passwords Generated" },
  { value: "94.2%", label: "Average Security Score" }
];

const benefits = [
  { title: "NIST SP 800-63B Guidelines", desc: "Password length regulations and entropy parameters modeled on official standards." },
  { title: "OWASP Top 10 Protections", desc: "Front-end sanitation and compliance designed to prevent standard attack vectors." },
  { title: "Client-Side Privacy", desc: "No plaintext credentials are saved. Hashing and local calculations preserve complete user privacy." }
];

const faqs = [
  {
    q: "How does the Strength Checker determine score and entropy?",
    a: "Our algorithm calculates structural entropy based on character diversity (uppercase, lowercase, digits, symbols) and password length. It evaluates repetitions and patterns to output a score from 0 to 100, aligning with logarithmic crack times."
  },
  {
    q: "Are my passwords sent to the server in plaintext?",
    a: "Absolutely not. Evaluations on the Checker page are calculated directly in the browser. When communicating with the authentication endpoints, passwords are encrypted over HTTPS and stored using strong, industry-standard cryptographic hashing on the server."
  },
  {
    q: "What is NIST compliance in this context?",
    a: "We align with NIST SP 800-63B guidelines which focus on password length (minimum 8-12 characters), character diversity, and avoiding predictable sequences rather than arbitrary replacement rules."
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 cyber-grid">
      {/* Landing Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SentinelPass</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              <Fingerprint className="h-3.5 w-3.5" />
              Enterprise-Grade Credentials
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Secure Credentials. <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                Prevent Exploitation.
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze password strength, calculate logarithmic crack complexity, and generate cryptographically secure
              random credentials. Modeled on NIST SP 800-63B and OWASP standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/password-checker">
                <Button size="lg" variant="outline">
                  Check Password Strength
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Graphic/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative h-80 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900/60 dark:backdrop-blur-md">
              <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                <Lock className="h-5 w-5 animate-bounce" />
              </div>
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Live Audit Terminal</span>
                    <span className="text-xs text-green-500">Online</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                    <p className="text-blue-500">$ npx sentinel-pass --evaluate</p>
                    <p>&gt; Target: *******************</p>
                    <p>&gt; Entropy: 84.6 bits (Excellent)</p>
                    <p>&gt; Crack complexity: Log10 (22 Years)</p>
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50/50 p-3 text-xs text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                  Calculated locally via cryptographically secure random number generators (CSPRNG).
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-gray-200 bg-white/40 dark:border-gray-800 dark:bg-gray-900/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <p className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 md:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            System Modules
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-gray-400">
            A comprehensive cryptographic assessment environment designed to evaluate vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              whileHover={{ y: -5 }}
              className="glass-panel flex flex-col justify-between rounded-2xl p-6 shadow-sm transition-all"
            >
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feat.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{feat.desc}</p>
              </div>
              <Link to={feat.path} className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Launch Module <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits / Compliance Section */}
      <section className="border-t border-gray-200 bg-white/60 dark:border-gray-800 dark:bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Compliance Standards
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Our application integrates core specifications derived from NIST SP 800-63B directives and OWASP
                credential storage advisories.
              </p>
              <div className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-3 text-left">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{b.title}</h4>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel flex flex-col justify-between rounded-2xl p-6 dark:border-gray-800">
              <Quote className="h-8 w-8 text-blue-200 dark:text-blue-800" />
              <p className="mt-4 text-sm italic text-gray-600 dark:text-gray-300">
                "We integrated SentinelPass's guidelines within our team workflow to educate engineers on entropy. The real-time evaluation works instantly, and our security scores have improved significantly."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">JD</div>
                <div>
                  <h4 className="text-xs font-bold">Jane Doe</h4>
                  <p className="text-[10px] text-gray-500">CISO, CyberSec Global</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 bg-white/20 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Static Footer */}
      <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} SentinelPass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
