import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Clipboard, Shield, Check, X, Sparkles, Terminal, Info } from "lucide-react";
import { passwordService } from "@/services/passwordService";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import Card, { CardContent } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";
import type { PasswordAnalysisResult } from "@/types/password.types";

export default function StrengthCheckerPage() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<PasswordAnalysisResult | null>(null);
  const debouncedPassword = useDebounce(password, 250);

  const mutation = useMutation({
    mutationFn: (pw: string) => passwordService.checkStrength(pw),
    onSuccess: (data) => setResult(data),
  });

  useEffect(() => {
    if (debouncedPassword.length > 0) {
      mutation.mutate(debouncedPassword);
    } else {
      setResult(null);
    }
  }, [debouncedPassword]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value.slice(0, 128));
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPassword(text.slice(0, 128));
    } catch {
      console.warn("Unable to access clipboard. Please paste manually using Ctrl+V / Cmd+V.");
    }
  };

  const isPassphrase = result?.passphrase || (password.length > 18 && (password.includes(" ") || password.includes("-") || password.includes("_")));

  const crackTimeEstimator = (entropy: number) => {
    if (entropy === 0) return { online: "0s", gpu: "0s", supercomputer: "0s" };

    const combinations = Math.pow(2, entropy);
    const speedOnline = 100;
    const speedGpu = 1e10;
    const speedSuper = 1e14;

    const format = (seconds: number) => {
      if (seconds < 1) return "Instant";
      if (seconds < 60) return `${Math.round(seconds)}s`;
      if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)}d`;
      if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)}y`;
      return "Centuries";
    };

    return {
      online: format((combinations / 2) / speedOnline),
      gpu: format((combinations / 2) / speedGpu),
      supercomputer: format((combinations / 2) / speedSuper),
    };
  };

  const times = result ? crackTimeEstimator(result.entropy) : null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 75) return "text-green-500 border-green-500/20 bg-green-500/5";
    if (score >= 60) return "text-blue-500 border-blue-500/20 bg-blue-500/5";
    if (score >= 40) return "text-yellow-500 border-yellow-500/20 bg-yellow-500/5";
    if (score >= 20) return "text-orange-500 border-orange-500/20 bg-orange-500/5";
    return "text-red-500 border-red-500/20 bg-red-500/5";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-emerald-500 to-teal-400";
    if (score >= 75) return "bg-gradient-to-r from-green-500 to-emerald-400";
    if (score >= 60) return "bg-gradient-to-r from-blue-600 to-blue-400";
    if (score >= 40) return "bg-gradient-to-r from-yellow-500 to-orange-400";
    if (score >= 20) return "bg-gradient-to-r from-orange-500 to-red-400";
    return "bg-gradient-to-r from-red-600 to-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          Password Strength Checker
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Analyze password complexity, entropy, and structural vulnerabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel overflow-hidden border-gray-200/60 dark:border-gray-800/80">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <PasswordInput
                      label="Input Password"
                      placeholder="Type or paste credentials..."
                      value={password}
                      onChange={handleChange}
                      maxLength={128}
                      className="pr-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePaste}
                      className="h-11 gap-1.5 rounded-xl border-gray-200 dark:border-gray-800"
                    >
                      <Clipboard className="h-4 w-4" />
                      Paste
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPassword("")}
                      className="h-11 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>Maximum length: 128 characters</span>
                  <span>{password.length}/128</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Strength Rating
                      </span>
                      <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mt-0.5">
                        {result.strength}
                      </h3>
                    </div>
                    <div className={`rounded-xl border px-3 py-1.5 text-center text-sm font-extrabold ${getScoreColor(result.score)}`}>
                      Score: {result.score}/100
                    </div>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressBarColor(result.score)}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                {isPassphrase && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/50 p-4.5 dark:border-blue-900/40 dark:bg-blue-950/20 text-left">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 dark:text-white">Passphrase Structure Detected</h4>
                      <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                        Long words separated by spaces/hyphens are highly resilient against brute-force attacks while remaining easy to memorize.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { label: "Uppercase", met: result.checks.uppercase },
                    { label: "Lowercase", met: result.checks.lowercase },
                    { label: "Numbers", met: result.checks.numbers },
                    { label: "Symbols", met: result.checks.symbols },
                    { label: "No Dictionary", met: !result.checks.dictionary },
                    { label: "No Patterns", met: !result.checks.keyboardPattern && !result.checks.sequence && !result.checks.repeated },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
                        item.met
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400"
                          : "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-500"
                      }`}
                    >
                      {item.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Estimated Crack Time
                  </h4>
                  {times && (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white/40 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900/20">
                      <div className="flex items-center justify-between p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">Online Throttling</span>
                          <p className="text-[10px]">100 guesses/sec (standard login portal)</p>
                        </div>
                        <span className="text-sm font-bold text-green-500">{times.online}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">Offline GPU Rig</span>
                          <p className="text-[10px]">10 Billion guesses/sec (standard hacker setup)</p>
                        </div>
                        <span className="text-sm font-bold text-amber-500">{times.gpu}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">Supercomputer Cluster</span>
                          <p className="text-[10px]">100 Trillion guesses/sec (state-sponsored attack)</p>
                        </div>
                        <span className="text-sm font-bold text-red-500">{times.supercomputer}</span>
                      </div>
                    </div>
                  )}
                </div>

                {result.crackTime && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/30">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">Backend estimate:</span> {result.crackTime}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Structural Variables
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Password Length:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{password.length} characters</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Entropy Score:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {result ? `${Math.round(result.entropy)} bits` : "0 bits"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {result && result.suggestions.length > 0 && (
            <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-4.5 w-4.5 text-blue-600 dark:text-blue-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security Recommendations</h3>
                </div>
                <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-left">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80 bg-blue-500/5 border-blue-500/10">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  NIST Guidance
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed text-left">
                NIST recommends prioritizing password length over mandatory symbol rotations. Consider using a 4-word passphrase instead of a short, complex password.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
