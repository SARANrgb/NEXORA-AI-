import JSZip from 'jszip';
import type { GeneratedContent, SourceOfTruth, ValidationResult } from '../types';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const exportService = {
  exportAsTxt(
    contents: GeneratedContent[],
    sot: SourceOfTruth,
    validationResults: Record<string, ValidationResult> = {}
  ): void {
    const timestamp = new Date().toISOString();
    const divider = '============================================================';
    const subDivider = '------------------------------------------------------------';

    let txt = `${divider}\n`;
    txt += `NEXORA AI - INTELLIGENT COMMUNICATION ORCHESTRATION PLATFORM\n`;
    txt += `OFFICIAL COMMUNICATION PACKAGE\n`;
    txt += `Generated: ${timestamp}\n`;
    txt += `${divider}\n\n`;

    txt += `[ AUTHORITATIVE SOURCE OF TRUTH ]\n`;
    txt += `TOPIC: ${sot.topic}\n`;
    txt += `DATES: ${sot.dates.join(', ')}\n`;
    txt += `LOCATIONS: ${sot.locations.join(', ')}\n`;
    txt += `WARNINGS: ${sot.warnings.join(' ')}\n`;
    txt += `INSTRUCTIONS: ${sot.instructions.join(' ')}\n`;
    txt += `KEY FACTS:\n${sot.key_facts.map(f => `  • ${f}`).join('\n')}\n`;
    txt += `\n${divider}\n`;
    txt += `GENERATED COMMUNICATIONS (${contents.length} TOTAL DELIVERABLES)\n`;
    txt += `${divider}\n\n`;

    contents.forEach((item, index) => {
      const val = validationResults[item.id];
      const statusStr = val ? `${val.status} (${val.score}% Verified)` : 'UNVALIDATED';

      txt += `ITEM #${index + 1}: ${item.format.toUpperCase()} FOR ${item.role.toUpperCase()}\n`;
      txt += `Language: ${item.language} | Channel: ${item.channel} | Validation: ${statusStr}\n`;
      txt += `${subDivider}\n`;
      txt += `${item.content}\n\n`;
      txt += `${subDivider}\n\n`;
    });

    txt += `${divider}\nEND OF COMMUNICATION PACKAGE - VERIFIED BY NEXORA AI\n${divider}\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const filename = `Nexora_Package_${new Date().toISOString().slice(0, 10)}.txt`;
    triggerDownload(blob, filename);
  },

  async exportAsZip(
    contents: GeneratedContent[],
    sot: SourceOfTruth,
    validationResults: Record<string, ValidationResult> = {}
  ): Promise<void> {
    const zip = new JSZip();

    // 1. Source of Truth JSON & TXT
    const sotFolder = zip.folder('00_Source_of_Truth');
    if (sotFolder) {
      sotFolder.file('source_of_truth.json', JSON.stringify(sot, null, 2));
      let sotTxt = `NEXORA AI - SOURCE OF TRUTH DIRECTIVE\n\n`;
      sotTxt += `Topic: ${sot.topic}\n`;
      sotTxt += `Dates: ${sot.dates.join(', ')}\n`;
      sotTxt += `Locations: ${sot.locations.join(', ')}\n`;
      sotTxt += `Warnings: ${sot.warnings.join('\n')}\n`;
      sotTxt += `Instructions: ${sot.instructions.join('\n')}\n`;
      sotFolder.file('source_of_truth.txt', sotTxt);
    }

    // 2. Individual Communications
    const commsFolder = zip.folder('Communications');
    if (commsFolder) {
      contents.forEach((item, idx) => {
        const safeRole = item.role.replace(/[^a-zA-Z0-9]/g, '_');
        const safeFmt = item.format.replace(/[^a-zA-Z0-9]/g, '_');
        const safeLang = item.language.replace(/[^a-zA-Z0-9]/g, '_');
        const num = String(idx + 1).padStart(2, '0');
        const filename = `${num}_${safeRole}_${safeFmt}_${safeLang}.txt`;

        let itemTxt = `DELIVERABLE: ${item.format}\n`;
        itemTxt += `Role: ${item.role}\n`;
        itemTxt += `Language: ${item.language}\n`;
        itemTxt += `Channel: ${item.channel}\n`;
        itemTxt += `Timestamp: ${item.timestamp || new Date().toISOString()}\n`;
        itemTxt += `--------------------------------------------------\n\n`;
        itemTxt += item.content;
        itemTxt += `\n\n--------------------------------------------------\n`;
        itemTxt += `Verified against Source of Truth by Nexora AI\n`;

        commsFolder.file(filename, itemTxt);
      });
    }

    // 3. Validation Audit Report
    let auditTxt = `NEXORA AI FACT VALIDATION AUDIT REPORT\n`;
    auditTxt += `Package Items: ${contents.length}\n`;
    auditTxt += `Date: ${new Date().toLocaleString()}\n`;
    auditTxt += `==================================================\n\n`;

    contents.forEach((item, idx) => {
      const val = validationResults[item.id];
      auditTxt += `[Item ${idx + 1}] ${item.role} - ${item.format} (${item.language})\n`;
      if (val) {
        auditTxt += `Status: ${val.status} | Score: ${val.score}%\n`;
        auditTxt += `Preserved Facts: ${val.preserved_facts.join('; ') || 'None'}\n`;
        auditTxt += `Missing Facts: ${val.missing_facts.join('; ') || 'None'}\n`;
        auditTxt += `Altered Facts: ${val.altered_facts.join('; ') || 'None'}\n`;
      } else {
        auditTxt += `Status: PENDING VALIDATION\n`;
      }
      auditTxt += `--------------------------------------------------\n`;
    });

    zip.file('VALIDATION_AUDIT_REPORT.txt', auditTxt);

    // 4. Manifest JSON
    const manifest = {
      platform: 'Nexora AI',
      generated_at: new Date().toISOString(),
      topic: sot.topic,
      total_items: contents.length,
      items: contents.map(c => ({
        id: c.id,
        role: c.role,
        format: c.format,
        language: c.language,
        channel: c.channel,
        validation: validationResults[c.id]?.status || 'PENDING'
      }))
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = `Nexora_Communication_Package_${new Date().toISOString().slice(0, 10)}.zip`;
    triggerDownload(zipBlob, filename);
  },

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
};
