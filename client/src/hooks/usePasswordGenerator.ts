import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { passwordService } from "@/services/passwordService";
import { useUiStore } from "@/store/uiStore";
import type { GenerateOptions, GenerateResult, GeneratePassphraseResult, StrengthResult } from "@/types/password.types";

export function usePasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const { addToast } = useUiStore();

  const standardMutation = useMutation<GenerateResult, Error, GenerateOptions>({
    mutationFn: (options: GenerateOptions) => passwordService.generate(options),
    onSuccess: (result) => {
      setGeneratedPassword(result.password);
      setStrength(result.strength);
      addToast({ type: "success", message: "Secure password generated successfully" });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      addToast({ type: "error", message: err.response?.data?.message || "Failed to generate password" });
    },
  });

  const passphraseMutation = useMutation<GeneratePassphraseResult, Error, { words?: number; separator?: string }>({
    mutationFn: (options) => passwordService.generatePassphrase(options),
    onSuccess: (result) => {
      setGeneratedPassword(result.passphrase);
      setStrength(null);
      addToast({ type: "success", message: "Secure passphrase generated successfully" });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      addToast({ type: "error", message: err.response?.data?.message || "Failed to generate passphrase" });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({ type: "success", message: "Password copied to clipboard!" });
    } catch {
      addToast({ type: "error", message: "Failed to copy to clipboard" });
    }
  };

  return {
    generate: standardMutation.mutate,
    generatePassphrase: passphraseMutation.mutate,
    isGenerating: standardMutation.isPending || passphraseMutation.isPending,
    generatedPassword,
    strength,
    copyToClipboard,
  };
}
