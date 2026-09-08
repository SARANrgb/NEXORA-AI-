import type { SourceOfTruth } from '../types';
import { API_BASE } from '../apiConfig';

export const DEMO_SOURCE_TEXT =
  "Heavy rainfall is expected in District A, District B and District C from August 23–25. Fishermen should not venture into the sea. Emergency response teams should remain active.";

export const DEMO_SOURCE_OF_TRUTH: SourceOfTruth = {
  topic: "Heavy Rainfall Warning",
  dates: ["August 23–25"],
  locations: ["District A", "District B", "District C"],
  warnings: ["Fishermen should not venture into the sea."],
  instructions: ["Emergency response teams should remain active."],
  key_facts: [
    "Heavy rainfall expected across coastal and inland regions",
    "High potential for waterlogging and disruption of essential services",
    "Precautionary flood monitoring initiated"
  ],
  numbers: ["August 23–25", "3 Districts"],
  entities: ["Fishermen", "Emergency response teams", "District Administration"],
  context: "Official Meteorological Directive & Emergency Response Advisory",
  contact: ["Emergency Control Room: 1077"],
  constraints: ["Maritime ban active for 72 hours"]
};

export const SAMPLE_PRESETS = [
  {
    title: "Heavy Rainfall Warning (Official Demo)",
    badge: "Official Demo",
    text: DEMO_SOURCE_TEXT
  },
  {
    title: "Public Health Blood Donation Camp",
    badge: "Public Health",
    text: "PUBLIC HEALTH BLOOD DONATION CAMP\n\nA blood donation camp will be conducted on September 15 at Government Community Hall from 9:00 AM to 2:00 PM.\n\nAdults between 18 and 60 years of age may participate.\n\nParticipants should carry a valid identification document.\n\nFor assistance, contact health helpline 104."
  },
  {
    title: "Cyclone Impact Advisory",
    badge: "Coastal Alert",
    text: "Severe cyclonic storm forecast for Coastal Zone 1 and Zone 2 from October 12–14. Wind gusts up to 90 km/h. Coastal evacuations must proceed before 18:00 hrs on October 12. Power utilities on standby."
  }
];

export const sourceOfTruthService = {
  getDemoText(): string {
    return DEMO_SOURCE_TEXT;
  },

  getDemoSourceOfTruth(): SourceOfTruth {
    return JSON.parse(JSON.stringify(DEMO_SOURCE_OF_TRUTH));
  },

  getSamplePresets() {
    return SAMPLE_PRESETS;
  },

  async uploadFile(file: File): Promise<{
    filename: string;
    file_type: string;
    extracted_text: string;
    source_of_truth: SourceOfTruth;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errText = 'Failed to upload document.';
      try {
        const errJson = await response.json();
        if (errJson.detail) errText = errJson.detail;
      } catch {}
      throw new Error(errText);
    }

    return await response.json();
  },

  async extract(text: string, forceDemo: boolean = false): Promise<SourceOfTruth> {
    const isExactDemoText = text.trim() === DEMO_SOURCE_TEXT.trim();
    if (forceDemo && isExactDemoText) {
      return new Promise((resolve) => setTimeout(() => resolve(this.getDemoSourceOfTruth()), 300));
    }

    // Call backend extraction endpoint
    try {
      const response = await fetch(`${API_BASE}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      console.warn('Backend extraction endpoint unreachable, executing local extractor.');
    }

    // Client-side fallback dynamic extractor
    const cleanText = text.trim();
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    let topic = "Public Directive";
    if (lines[0]) {
      const firstLine = lines[0].replace(/^[#*_\-\s]+/, '').trim();
      const eventMatch = firstLine.split(/\b(?:will occur|will be held|will take place|is scheduled|will be conducted|is planned)\b/i);
      if (eventMatch.length > 1 && eventMatch[0].trim().length > 5) {
        topic = eventMatch[0].trim();
      } else {
        topic = firstLine.slice(0, 55).trim();
      }
    }

    const dates: string[] = [];
    const monthNames = '(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*';
    const dateRegex = new RegExp(`\\b(?:${monthNames}\\s+\\d{1,2}(?:st|nd|rd|th)?(?:(?:–|-| to )\\d{1,2})?(?:,?\\s+\\d{4})?|\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?${monthNames}(?:,?\\s+\\d{4})?)\\b`, 'gi');
    const dateMatches = cleanText.match(dateRegex);
    if (dateMatches) {
      dateMatches.forEach(d => { if (!dates.includes(d)) dates.push(d); });
    }

    const locs: string[] = [];
    const venueMatches = cleanText.match(/(?:at|in|venue:?)\s+([A-Z][A-Za-z0-9\s]+(?:Hall|Center|Centre|Hospital|Ground|Room|Auditorium|Complex|Building|Station|District|Zone))\b/g);
    if (venueMatches) {
      venueMatches.forEach(v => {
        const cleaned = v.replace(/^(?:at|in|venue:?)\s+/i, '').trim();
        if (cleaned && !locs.includes(cleaned)) locs.push(cleaned);
      });
    }

    for (const place of ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "District A", "District B", "District C", "District D"]) {
      if (new RegExp(`\\b${place}\\b`, 'i').test(cleanText) && !locs.includes(place)) {
        locs.push(place);
      }
    }

    const sentences = cleanText.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 8);
    const warnings: string[] = [];
    const instructions: string[] = [];
    const contacts: string[] = [];

    const contactMatches = cleanText.match(/(?:helpline|contact|phone|toll[- ]free)\s*(?:is|at|:)?\s*([0-9]{3,12})/gi);
    if (contactMatches) {
      contactMatches.forEach(c => contacts.push(c.trim()));
    }

    sentences.forEach(s => {
      const sl = s.toLowerCase();
      if (sl.includes('warning') || sl.includes('should not') || sl.includes('must not') || sl.includes('avoid') || sl.includes('between 18 and 60') || sl.includes('participate') || sl.includes('mandatory')) {
        warnings.push(s.endsWith('.') ? s : s + '.');
      } else if (sl.includes('conducted') || sl.includes('active') || sl.includes('contact') || sl.includes('carry') || sl.includes('should') || sl.includes('must') || sl.includes('occur') || sl.includes('maintenance') || sl.includes('camp') || sl.includes('vaccination')) {
        instructions.push(s.endsWith('.') ? s : s + '.');
      }
    });

    if (instructions.length === 0 && sentences.length > 0) {
      instructions.push(sentences[0].endsWith('.') ? sentences[0] : sentences[0] + '.');
    }

    return {
      topic: topic.length > 0 ? topic : "Public Directive",
      dates: dates.length ? dates : ["Notice Window"],
      locations: locs.length ? locs : ["Designated Venue"],
      warnings: warnings.length ? warnings : ["Follow official program requirements."],
      instructions: instructions.length ? instructions : ["Proceed as scheduled."],
      key_facts: sentences.slice(0, 3).map(s => s.endsWith('.') ? s : s + '.'),
      numbers: dates,
      entities: ["Participants", "Coordinators"],
      context: "Extracted from source document",
      contact: contacts
    };
  }
};
