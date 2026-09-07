import type { PresetPackage } from '../types';

export const ROLES = [
  'Citizen',
  'Field Officer',
  'Senior Official',
  'Media Team',
  'Social Media Team'
] as const;

export const FORMATS = [
  'Public Advisory',
  'Action Checklist',
  'Executive Summary',
  'Press Release',
  'Social Media Post',
  'Presentation',
  'FAQ'
] as const;

export const LANGUAGES = [
  'English',
  'Tamil',
  'Hindi',
  'Telugu',
  'Malayalam',
  'Kannada'
] as const;

export const CHANNELS = [
  'WhatsApp',
  'Email',
  'Social Media',
  'Dashboard',
  'PDF'
] as const;

export const PRESET_PACKAGES: PresetPackage[] = [
  {
    id: 'core-incident-suite',
    title: 'Core Incident Response Suite (Recommended Demo)',
    badge: '5 Tailored Outputs',
    description: 'Generates an Executive Summary for Leadership, Public Advisory in Tamil/English, Field Checklist, and Press Release.',
    roles: ['Citizen', 'Field Officer', 'Senior Official', 'Media Team'],
    formats: ['Public Advisory', 'Action Checklist', 'Executive Summary', 'Press Release'],
    languages: ['English', 'Tamil'],
    channels: ['WhatsApp', 'Dashboard', 'Email']
  },
  {
    id: 'citizen-multilingual',
    title: 'Multilingual Public Warning Campaign',
    badge: 'Regional Reach',
    description: 'Broad consumer emergency broadcast targeting citizens across English, Tamil, and Hindi via WhatsApp and Social Media.',
    roles: ['Citizen'],
    formats: ['Public Advisory', 'Social Media Post'],
    languages: ['English', 'Tamil', 'Hindi'],
    channels: ['WhatsApp', 'Social Media']
  },
  {
    id: 'field-readiness',
    title: 'Ground Operations & Leadership Briefing',
    badge: 'Operational',
    description: 'High-urgency operational instructions for Field Officers and high-level briefing for Senior Officials.',
    roles: ['Senior Official', 'Field Officer'],
    formats: ['Executive Summary', 'Action Checklist'],
    languages: ['English'],
    channels: ['Dashboard', 'PDF', 'WhatsApp']
  }
];

export const orchestrationService = {
  getRoles(): string[] {
    return [...ROLES];
  },

  getFormats(): string[] {
    return [...FORMATS];
  },

  getLanguages(): string[] {
    return [...LANGUAGES];
  },

  getChannels(): string[] {
    return [...CHANNELS];
  },

  getPresets(): PresetPackage[] {
    return PRESET_PACKAGES;
  },

  calculateCount(roles: string[], formats: string[], languages: string[], channels: string[]): number {
    if (!roles.length || !formats.length || !languages.length || !channels.length) return 0;
    return roles.length * formats.length * languages.length * channels.length;
  },

  formatSummary(roles: string[], formats: string[], languages: string[], channels: string[]): string {
    const r = roles.length ? roles.join(', ') : 'No Role';
    const f = formats.length ? formats.join(', ') : 'No Format';
    const l = languages.length ? languages.join(', ') : 'No Language';
    const c = channels.length ? channels.join(', ') : 'No Channel';
    return `${r} • ${f} • ${l} • ${c}`;
  }
};
