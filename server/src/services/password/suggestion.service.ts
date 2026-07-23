import { PasswordChecks } from "@/interfaces";

export function generateSuggestions(input: {
  length: number;
  checks: PasswordChecks;
  isPassphrase: boolean;
  entropy: number;
}): string[] {
  const suggestions: string[] = [];

  if (input.length < 12) {
    suggestions.push("Increase password length to at least 12 characters");
  } else if (input.length < 16) {
    suggestions.push("Consider using 16 or more characters for stronger security");
  }

  if (!input.checks.uppercase) {
    suggestions.push("Add uppercase letters");
  }
  if (!input.checks.lowercase) {
    suggestions.push("Add lowercase letters");
  }
  if (!input.checks.numbers) {
    suggestions.push("Add numbers");
  }
  if (!input.checks.symbols) {
    suggestions.push("Add special characters (!@#$%^&*)");
  }

  if (input.checks.dictionary) {
    suggestions.push("Avoid common passwords that appear in breach databases");
  }
  if (input.checks.keyboardPattern) {
    suggestions.push("Avoid keyboard patterns like qwerty or asdf");
  }
  if (input.checks.sequence) {
    suggestions.push("Avoid sequential characters like abc or 123");
  }
  if (input.checks.repeated) {
    suggestions.push("Avoid repeated characters or repeated words");
  }

  if (!input.isPassphrase && input.length < 16 && input.entropy < 60) {
    suggestions.push("Consider using a passphrase with 4 or more unrelated words");
  }

  if (input.entropy < 40) {
    suggestions.push("Increase the overall randomness of your password");
  }

  return suggestions;
}
