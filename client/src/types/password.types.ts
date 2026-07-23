export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  dictionary: boolean;
  keyboardPattern: boolean;
  sequence: boolean;
  repeated: boolean;
}

export interface PasswordAnalysisResult {
  score: number;
  strength: string;
  entropy: number;
  crackTime: string;
  passphrase: boolean;
  checks: PasswordChecks;
  suggestions: string[];
}

export interface StrengthResult {
  score: number;
  label: string;
  details: {
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    length: number;
    entropy: number;
  };
  recommendations: string[];
}

export interface GenerateOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
}

export interface GenerateResult {
  password: string;
  strength: StrengthResult;
  entropy: number;
  strengthLabel: string;
  crackTime: string;
  score: number;
}

export interface GeneratePassphraseResult {
  passphrase: string;
  entropy: number;
  strength: string;
  crackTime: string;
}

export interface PasswordLog {
  id: string;
  userId: string;
  strengthScore: number;
  strengthLabel: string;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  entropy: number;
  createdAt: string;
}
