export interface SourceOfTruth {
  topic: string;
  key_facts: string[];
  dates: string[];
  numbers: string[];
  locations: string[];
  entities: string[];
  instructions: string[];
  warnings: string[];
  context: string;
}

export interface GeneratedContent {
  id: string;
  role: string;
  format: string;
  language: string;
  channel: string;
  content: string;
}

export interface ValidationResult {
  status: 'PASS' | 'REVIEW';
  score: number;
  preserved_facts: string[];
  missing_facts: string[];
  altered_facts: string[];
}
