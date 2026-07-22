import { Check, X } from "lucide-react";

interface PasswordDetailsProps {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  length: number;
  entropy: number;
}

function DetailItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm ${met ? "text-green-700" : "text-red-700"}`}>{label}</span>
    </div>
  );
}

export default function PasswordDetails({ hasUppercase, hasLowercase, hasNumbers, hasSymbols, length, entropy }: PasswordDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4">
      <DetailItem label="Uppercase (A-Z)" met={hasUppercase} />
      <DetailItem label="Lowercase (a-z)" met={hasLowercase} />
      <DetailItem label="Numbers (0-9)" met={hasNumbers} />
      <DetailItem label="Symbols (!@#)" met={hasSymbols} />
      <div className="col-span-2 mt-2 border-t border-gray-200 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Length:</span>
          <span className="font-medium text-gray-900">{length} characters</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Entropy:</span>
          <span className="font-medium text-gray-900">{entropy.toFixed(1)} bits</span>
        </div>
      </div>
    </div>
  );
}
