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
  contact?: string[];
  constraints?: string[];
}

export interface GeneratedContent {
  id: string;
  role: string;
  format: string;
  language: string;
  channel: string;
  content: string;
  timestamp?: string;
  isFlawed?: boolean;
}

export interface FactValidationItem {
  category: 'DATES' | 'LOCATIONS' | 'WARNINGS' | 'INSTRUCTIONS' | 'KEY_FACTS' | 'NUMBERS';
  item: string;
  status: 'PRESERVED' | 'MISSING' | 'ALTERED';
  detail?: string;
}

export interface ValidationResult {
  status: 'PASS' | 'REVIEW';
  score: number;
  preserved_facts: string[];
  missing_facts: string[];
  altered_facts: string[];
  categorized_items?: FactValidationItem[];
}

export interface OrchestrationConfig {
  roles: string[];
  formats: string[];
  languages: string[];
  channels: string[];
}

export interface PresetPackage {
  id: string;
  title: string;
  badge: string;
  description: string;
  roles: string[];
  formats: string[];
  languages: string[];
  channels: string[];
}
