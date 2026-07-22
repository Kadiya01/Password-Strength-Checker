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
