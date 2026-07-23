export interface StrengthCheckInput {
  password: string;
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

export interface GenerateInput {
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
}

export interface PasswordLogEntry {
  id: string;
  userId: string;
  strengthScore: number;
  strengthLabel: string;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  entropy: number;
  createdAt: Date;
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

export interface EntropyResult {
  bits: number;
  poolSize: number;
  searchSpace: string;
  algorithm: string;
}

export interface CrackTimes {
  offline: string;
  online: string;
  gpu: string;
  dictionary: string;
}

export interface DictionaryCheckResult {
  found: boolean;
  matched: string | null;
}

export interface LeetCheckResult {
  normalized: string;
  isLeet: boolean;
}

export interface KeyboardPatternResult {
  found: boolean;
  patterns: string[];
}

export interface SequenceCheckResult {
  found: boolean;
  types: string[];
  patterns: string[];
}

export interface PatternCheckResult {
  keyboardPattern: boolean;
  sequence: boolean;
  repeated: boolean;
  patterns: string[];
}

export interface ScoringInput {
  length: number;
  entropy: number;
  isPassphrase: boolean;
  dictionaryHit: boolean;
  keyboardPattern: boolean;
  sequence: boolean;
  repeated: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
}

export interface CharacterPoolOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseGeneratorOptions {
  words: number;
  separator: string;
}

export interface GeneratorEntropyResult {
  entropy: number;
  poolSize: number;
  searchSpace: number;
  estimatedCrackTime: string;
}

export interface GenerateEnhancedResult {
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
