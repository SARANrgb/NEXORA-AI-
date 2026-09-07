import type { SourceOfTruth, GeneratedContent, ValidationResult } from './types';
import { API_BASE } from './apiConfig';

const MOCK_SOURCE_OF_TRUTH: SourceOfTruth = {
  topic: "Heavy Rainfall Warning",
  key_facts: ["Heavy rainfall expected"],
  dates: ["August 23–25"],
  numbers: [],
  locations: ["District A", "District B", "District C"],
  entities: ["Fishermen", "Emergency response teams"],
  instructions: ["Emergency response teams should remain active."],
  warnings: ["Fishermen should not venture into the sea."],
  context: "Routine weather update"
};

export const extractSourceOfTruth = async (text: string): Promise<SourceOfTruth> => {
  try {
    const res = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unreachable, using local mock data for extraction.');
  }
  
  // Fallback to mock for GitHub Pages Demo
  return new Promise(resolve => setTimeout(() => resolve(MOCK_SOURCE_OF_TRUTH), 800));
};

export const generateCommunication = async (payload: any): Promise<GeneratedContent[]> => {
  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unreachable, using local mock data for generation.');
  }

  // Fallback to mock for GitHub Pages Demo
  return new Promise(resolve => setTimeout(() => {
    const results: GeneratedContent[] = [];
    payload.roles.forEach((role: string) => {
      payload.formats.forEach((fmt: string) => {
        payload.languages.forEach((lang: string) => {
          payload.channels.forEach((channel: string) => {
            let content = `Dear ${role},\nThis is a ${fmt} regarding ${payload.source_of_truth.topic}.\nPlease note the heavy rainfall in ${payload.source_of_truth.locations.join(', ')} from ${payload.source_of_truth.dates.join(', ')}.\nWarning: ${payload.source_of_truth.warnings.join(', ')}\nAction required: ${payload.source_of_truth.instructions.join(', ')}\nStay safe.\nSent via ${channel} in ${lang}.`;
            
            if (role === 'Field Officer' && fmt === 'Action Checklist') {
              content = "Heavy rainfall is expected in District A and District B until August 24. Ensure basic provisions.";
            }

            results.push({
              id: Math.random().toString(36).substring(7),
              role,
              format: fmt,
              language: lang,
              channel,
              content
            });
          });
        });
      });
    });
    resolve(results);
  }, 1000));
};

export const validateContent = async (payload: any): Promise<ValidationResult> => {
  try {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unreachable, using local mock data for validation.');
  }

  // Fallback to mock for GitHub Pages Demo
  return new Promise(resolve => setTimeout(() => {
    const content = payload.generated_content;
    if (!content.includes("District C") && content.includes("August 24")) {
      resolve({
        status: "REVIEW",
        score: 40,
        preserved_facts: ["District A", "District B"],
        missing_facts: ["District C", "August 25", "Fishermen warning", "Emergency instruction"],
        altered_facts: ["Dates altered to August 24"]
      });
    } else {
      resolve({
        status: "PASS",
        score: 96,
        preserved_facts: ["August 23–25", "District A", "District B", "District C", "Fishermen warning", "Emergency instruction"],
        missing_facts: [],
        altered_facts: []
      });
    }
  }, 1000));
};
