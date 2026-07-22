import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { passwordService } from "@/services/passwordService";
import { useUiStore } from "@/store/uiStore";
import type { GenerateOptions, GenerateResult, StrengthResult } from "@/types/password.types";

export function usePasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const { addToast } = useUiStore();

  const mutation = useMutation<GenerateResult, Error, GenerateOptions>({
    mutationFn: (options: GenerateOptions) => passwordService.generate(options),
    onSuccess: (result) => {
      setGeneratedPassword(result.password);
      setStrength(result.strength);
    },
    onError: () => {
      addToast({ type: "error", message: "Failed to generate password" });
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
    generate: mutation.mutate,
    isGenerating: mutation.isPending,
    generatedPassword,
    strength,
    copyToClipboard,
  };
}
