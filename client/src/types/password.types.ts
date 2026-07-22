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
}

export interface PasswordLog {
  id: number;
  userId: number;
  strengthScore: number;
  strengthLabel: string;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  entropy: number;
  createdAt: string;
}
