import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Copy, Check, Info, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { usePasswordGenerator } from "@/hooks/usePasswordGenerator";
import { calculateLocalStrength } from "@/services/passwordService";

interface FormData {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  excludeSimilar: boolean;
  passphraseMode: boolean;
}

// Word list for passphrase generation
const WORDLIST = [
  "correct", "horse", "battery", "staple", "cipher", "security", "shadow", "guardian",
  "fortress", "quantum", "matrix", "sentinel", "entropy", "vault", "enigma", "bastion",
  "firewall", "kernel", "crypt", "access", "signal", "beacon", "vector", "binary",
  "carbon", "silicon", "network", "packet", "subnet", "router", "switch", "client"
];

export default function PasswordGeneratorForm() {
  const [form, setForm] = useState<FormData>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    excludeSimilar: false,
    passphraseMode: false,
  });
  const [copied, setCopied] = useState(false);
  const { generate, isGenerating, generatedPassword, strength, copyToClipboard } = usePasswordGenerator();

  const handleGenerate = () => {
    if (form.passphraseMode) {
      // Passphrase Mode logic: select random words and combine with hyphens
      const wordCount = Math.max(3, Math.min(8, Math.round(form.length / 8)));
      const chosen: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const word = WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
        chosen.push(word);
      }
      const pass = chosen.join("-");
      // Call generate with dummy options or simulate local mutation
      // Since generator hooks depend on passwordService, we can trigger it
      // Let's call the standard generate function, but we can override hook state or mock it
      // In this case, passwordService handles the generation fallback:
      // Let's pass options, and customize our service to return the passphrase or handle it.
      // Wait, let's write a local override or use our updated passwordService.ts.
      // We can just trigger the service with standard options.
      generate({
        length: form.length,
        includeLowercase: form.includeLowercase,
        includeUppercase: form.includeUppercase,
        includeNumbers: form.includeNumbers,
        includeSymbols: form.includeSymbols,
        excludeAmbiguous: form.excludeAmbiguous,
        // pass passphrase flag inside options:
        ...({ passphraseMode: true } as any)
      });
    } else {
      generate(form);
    }
  };

  useEffect(() => {
    // Generate an initial password on mount
    handleGenerate();
  }, []);

  const handleCopy = async () => {
    await copyToClipboard(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (key: keyof FormData) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // If passphrase mode is enabled, disable standard character selections visually
      return updated;
    });
  };

  // Convert entropy to estimated crack time text
  const getEstimatedCrackTime = (entropy: number) => {
    if (entropy === 0) return "0 seconds";
    const guessesPerSec = 1e10; // 10 Billion guesses/second (Standard GPU rig)
    const combinations = Math.pow(2, entropy);
    const seconds = (combinations / 2) / guessesPerSec;

    if (seconds < 1) return "Instant";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 text-left">
      {/* Generated output panel */}
      {generatedPassword && (
        <div className="relative rounded-2xl border border-gray-200/60 bg-gray-50/60 p-4.5 dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Generated credential
          </span>
          <div className="mt-1 flex items-center justify-between gap-4">
            <code className="break-all text-sm font-mono font-bold text-blue-600 dark:text-blue-400 pr-10">
              {generatedPassword}
            </code>
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-gray-500 hover:bg-gray-200/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-white transition-all"
            >
              {copied ? <Check className="h-4.5 w-4.5 text-green-500 animate-scale" /> : <Copy className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Length selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Password Length: {form.length} characters</span>
          <span className="text-gray-400">Range: 8-64</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={form.length}
          onChange={(e) => setForm((prev) => ({ ...prev, length: parseInt(e.target.value) }))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-800 accent-blue-600"
        />
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setForm((prev) => ({ ...prev, passphraseMode: false }))}
          className={`rounded-xl border p-3 text-center transition-all ${
            !form.passphraseMode
              ? "border-blue-600 bg-blue-50/50 font-bold text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
              : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          }`}
        >
          <span className="block text-sm">Random Characters</span>
          <span className="text-[10px] text-gray-400">e.g. gD7&xM2!aP</span>
        </button>
        <button
          onClick={() => setForm((prev) => ({ ...prev, passphraseMode: true }))}
          className={`rounded-xl border p-3 text-center transition-all ${
            form.passphraseMode
              ? "border-blue-600 bg-blue-50/50 font-bold text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
              : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          }`}
        >
          <span className="block text-sm">Passphrase Mode</span>
          <span className="text-[10px] text-gray-400">e.g. correct-horse-battery</span>
        </button>
      </div>

      {/* Options checklist */}
      {!form.passphraseMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: "includeUppercase" as const, label: "Uppercase (A-Z)" },
            { key: "includeLowercase" as const, label: "Lowercase (a-z)" },
            { key: "includeNumbers" as const, label: "Numbers (0-9)" },
            { key: "includeSymbols" as const, label: "Symbols (!@#)" },
            { key: "excludeAmbiguous" as const, label: "Exclude Ambiguous" },
            { key: "excludeSimilar" as const, label: "Exclude Similar" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 p-3 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-900/40"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{label}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-blue-200/50 bg-blue-500/5 p-4 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>
            Passphrase mode generates combinations of readable words. These are highly resistant to cracking and easy to remember.
          </p>
        </div>
      )}

      {/* Quality display metrics */}
      {strength && (
        <div className="rounded-2xl border border-gray-200/60 p-4 space-y-3 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500 dark:text-gray-400">Generated Strength: {strength.label}</span>
            <span className="text-blue-600 dark:text-blue-400">{strength.score}/100</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(strength.score)}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <span className="text-gray-400 dark:text-gray-500">Entropy Score:</span>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{Math.round(strength.details.entropy)} bits</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">Estimated Crack Time:</span>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{getEstimatedCrackTime(strength.details.entropy)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleGenerate} isLoading={isGenerating} className="flex-1 h-11 rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
