import type { GeneratedContent, SourceOfTruth } from '../types';

const API_BASE = 'http://localhost:8000/api';

export function createLocalContent(
  sot: SourceOfTruth,
  role: string,
  format: string,
  language: string,
  channel: string
): string {
  const locs = sot.locations.join(', ');
  const dates = sot.dates.join(', ');
  const warns = sot.warnings.join(' ');
  const instrs = sot.instructions.join(' ');
  const contacts = sot.contact && sot.contact.length ? sot.contact.join(', ') : 'Official Helpdesk';

  const isRainfall = sot.topic.toLowerCase().includes('rainfall') || sot.warnings.some(w => w.toLowerCase().includes('sea') || w.toLowerCase().includes('fishermen'));

  // -----------------------------------------------------------------
  // TAMIL GENERATION
  // -----------------------------------------------------------------
  if (language === 'Tamil') {
    if (isRainfall) {
      if (role === 'Citizen' && format === 'Public Advisory') {
        return `🔴 பொது பாதுகாப்பு எச்சரிக்கை | ${sot.topic}

அன்புள்ள குடிமக்களே,
${locs} ஆகிய பகுதிகளில் ${dates} வரை மிக பலத்த மழை பெய்யக்கூடும் என எச்சரிக்கப்பட்டுள்ளது.

முக்கிய எச்சரிக்கை:
⚠️ {warns}

தேவையான நடவடிக்கைகள்:
• ${instrs}
• அத்தியாவசிய தேவையின்றி வீட்டை விட்டு வெளியேற வேண்டாம்.
• மின் கம்பங்கள் மற்றும் தேங்கிய மழைநீரை தவிர்க்கவும்.

வழங்கப்படும் ஊடகம்: ${channel} | ஆதாரம்: Nexora AI அதிகாரப்பூர்வ தளம்`;
      }

      if (role === 'Field Officer' && format === 'Action Checklist') {
        return `📋 கள அலுவலர் அவசரகால செயல்முறைப் பட்டியல்
பொருள்: ${sot.topic} | பகுதிகள்: ${locs}
காலக்கெடு: ${dates}

செயல்பாடுகள்:
[ ] ${instrs}
[ ] கடலோர மற்றும் தாழ்வான பகுதிகளில் ${warns} அமல்படுத்தவும்.
[ ] தற்காலிக நிவாரண முகாம்கள் மற்றும் குடிநீர் வசதியை தயார் செய்க.
[ ] தகவல்களை உடனுக்குடன் ${channel} மூலம் உயர் அதிகாரிகளுக்கு தெரிவிக்கவும்.`;
      }

      return `அதிகாரப்பூர்வ அறிக்கை (${role} - ${format})
பொருள்: ${sot.topic}
பகுதிகள்: ${locs} (${dates})
எச்சரிக்கை: ${warns}
நடவடிக்கை: ${instrs}
பகிர்வு முறை: ${channel} (${language})`;
    } else {
      // Dynamic non-rainfall / uploaded document
      const topicTamil = sot.topic.toLowerCase().includes('blood') ? 'ரத்த தான முகாம்' : sot.topic;
      if (role === 'Citizen' && format === 'Public Advisory') {
        return `🔴 பொது நல அறிவிப்பு | ${topicTamil} (${sot.topic})

இடம்: ${locs}
நடைபெறும் காலம்: ${dates}

முக்கிய தகவல்கள் & தகுதி வரம்பு:
⚠️ ${warns}

பங்கேற்பாளர்களுக்கான வழிகாட்டுதல்கள்:
• ${instrs}
• உதவி மற்றும் விபரங்களுக்கு தொடர்பு கொள்ளவும்: ${contacts}
• அனைவரும் பங்கேற்று நல்வாழ்வு திட்டத்திற்கு ஆதரவளிக்க கேட்டுக்கொள்ளப்படுகிறார்கள்.

வழங்கப்படும் ஊடகம்: ${channel} | அதிகாரப்பூர்வ ஆதாரம்: Nexora AI`;
      }

      if (role === 'Field Officer') {
        return `📋 கள அலுவலர் செயல்முறைப் பட்டியல் | ${topicTamil}
இடம்: ${locs} | காலம்: ${dates}

கள அலுவலர் பணிகள்:
[ ] ${instrs}
[ ] ${warns} - விதிமுறைகளை உறுதி செய்க.
[ ] உதவி எண் ${contacts} தொடர்பை தயார் நிலையில் வைக்கவும்.
[ ] கள நிலவரங்களை ${channel} மூலம் உடனுக்குடன் தலைமைக்கு தெரிவிக்கவும்.`;
      }

      return `அதிகாரப்பூர்வ தகவல் அறிக்கை (${role} - ${format})
நிகழ்வு: ${topicTamil} (${sot.topic})
இடம்: ${locs} | காலம்: ${dates}
விதிமுறைகள்: ${warns}
வழிகாட்டுதல்: ${instrs}
தொடர்பு: ${contacts} | ஊடகம்: ${channel}`;
    }
  }

  // -----------------------------------------------------------------
  // HINDI GENERATION
  // -----------------------------------------------------------------
  if (language === 'Hindi') {
    const topicHindi = sot.topic.toLowerCase().includes('blood') ? 'रक्तदान शिविर' : sot.topic;
    if (isRainfall) {
      if (role === 'Citizen' && format === 'Public Advisory') {
        return `🔴 सार्वजनिक सुरक्षा परामर्श | ${sot.topic}

स्थान: ${locs}
प्रभावी तिथियां: ${dates}

मुख्य चेतावनी:
⚠️ ${warns}

सुरक्षा निर्देश:
• ${instrs}
• निचले इलाकों और जलभराव वाले मार्गों से दूर रहें।
• आपातकालीन संपर्क नंबर तैयार रखें।

प्रसारण माध्यम: ${channel} | अधिकृत स्रोत: Nexora AI`;
      }
      return `आधिकारिक संचार (${role} - ${format})
विषय: ${sot.topic}
स्थान: ${locs} | तिथियां: ${dates}
चेतावनी: ${warns}
निर्देश: ${instrs}
माध्यम: ${channel}`;
    } else {
      return `🔴 आधिकारिक जन सूचना | ${topicHindi} (${sot.topic})

स्थान: ${locs}
समय व दिनांक: ${dates}

आवश्यक दिशानिर्देश व पात्रता:
⚠️ ${warns}

प्रतिभागियों के लिए निर्देश:
• ${instrs}
• पूछताछ एवं सहायता हेतु संपर्क करें: ${contacts}
• कृपया समय पर उपस्थित होकर कार्यक्रम को सफल बनाएं।

प्रसारण माध्यम: ${channel} | प्राधिकृत स्रोत: Nexora AI`;
    }
  }

  // -----------------------------------------------------------------
  // TELUGU, MALAYALAM, KANNADA
  // -----------------------------------------------------------------
  if (language === 'Telugu') {
    return `🔴 అత్యవసర అధికారిక సమాచారం (${role} - ${format})
అంశం: ${sot.topic}
ప్రాంతం: ${locs} (${dates})
ముఖ్య వివరాలు: ${warns}
చర్యలు: ${instrs}
సంప్రదించండి: ${contacts} | ప్రసార మాధ్యమం: ${channel}`;
  }

  if (language === 'Malayalam') {
    return `🔴 ഔദ്യോഗിക അറിയിപ്പ് (${role} - ${format})
വിഷയം: ${sot.topic}
സ്ഥലം: ${locs} (${dates})
നിർദ്ദേശങ്ങൾ: ${warns}
നടപടികൾ: ${instrs}
സഹായത്തിന്: ${contacts} | മാധ്യമം: ${channel}`;
  }

  if (language === 'Kannada') {
    return `🔴 ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ (${role} - ${format})
ವಿಷಯ: ${sot.topic}
ಸ್ಥಳ: ${locs} (${dates})
ಎಚ್ಚರಿಕೆ / ನಿಯಮಾವಳಿಗಳು: ${warns}
ಕ್ರಮಗಳು: ${instrs}
ಸಂಪರ್ಕಿಸಿ: ${contacts} | ಮಾಧ್ಯಮ: ${channel}`;
  }

  // -----------------------------------------------------------------
  // ENGLISH GENERATION
  // -----------------------------------------------------------------
  if (format === 'Executive Summary' || role === 'Senior Official') {
    return `EXECUTIVE INCIDENT BRIEFING: ${sot.topic.toUpperCase()}
Target Authority: ${role} | Channel: ${channel} | Classification: Critical Priority

1. SITUATION APPRAISAL
Official initiative scheduled for ${locs} effective ${dates}. Operational coordination required across all involved municipal desks.

2. MANDATORY PROTOCOLS & REQUIREMENTS
- ${warns}

3. DIRECTIVES FOR INTER-AGENCY RESPONSE
- ${instrs}
- Public assistance liaison point: ${contacts}
- Dispatched via ${channel} in ${language}.

Authorized by Nexora AI Multi-Channel Command Engine.`;
  }

  if (format === 'Action Checklist' || role === 'Field Officer') {
    return `TACTICAL ACTION CHECKLIST // FIELD CONTINGENCY
Operational Target: ${role} | Context: ${sot.topic}
Sectors: ${locs} | Active Window: ${dates}

[ ] VERIFY ENFORCEMENT: Ensure strict compliance with directive: "${warns}"
[ ] DEPLOYMENT: ${instrs}
[ ] PUBLIC LIAISON: Coordinate community assistance via ${contacts}
[ ] LOGGING: Submit hourly status reports via ${channel}.`;
  }

  if (format === 'Public Advisory' || role === 'Citizen') {
    return `URGENT PUBLIC SAFETY ADVISORY: ${sot.topic.toUpperCase()}
Applicable Sectors: ${locs}
Valid Period: ${dates}

CRITICAL NOTICE & REQUIREMENTS:
⚠️ ${warns}

WHAT YOU MUST DO:
• ${instrs}
• For queries, registration, or support, contact: ${contacts}
• Monitor verified updates broadcast through official ${channel} channels.

Issued in the interest of public safety and civic awareness.`;
  }

  if (format === 'Press Release' || role === 'Media Team') {
    return `PRESS RELEASE // FOR IMMEDIATE DISSEMINATION
Subject: Official Statement on ${sot.topic}
Target Regions: ${locs}
Forecasted Duration: ${dates}

STATE COMMUNICATIONS HEADQUARTERS:
The administration has issued an authoritative directive for ${locs} effective ${dates} regarding ${sot.topic}.

CRITICAL GUIDANCE:
"${warns}"

OPERATIONAL STATUS:
All designated coordinators and response units have moved to active readiness status. ${instrs}

Members of the press and public may direct inquiries to ${contacts}. Dispatched via ${channel}.`;
  }

  if (format === 'Social Media Post' || role === 'Social Media Team') {
    const hashtag = sot.topic.replace(/[^a-zA-Z0-9]/g, '');
    return `📢 #${hashtag}
📍 Venue: ${locs}
📅 Dates: ${dates}

⚠️ Notice: ${warns}
🛡️ Action: ${instrs}

📞 Helpline: ${contacts}
#PublicNotice #${channel.replace(/\s+/g, '')}`;
  }

  if (format === 'Presentation') {
    return `SLIDE BRIEFING: ${sot.topic.toUpperCase()}
Target Audience: ${role} | Channel: ${channel}

SLIDE 1: Scope & Operational Focus
- Venue / Locations: ${locs}
- Timeline: ${dates}

SLIDE 2: Directives & Requirements
- Primary Advisory: ${warns}

SLIDE 3: Execution Framework
- Mandatory Protocol: ${instrs}
- Public Support Desk: ${contacts}
- Broadcasted via ${channel} in ${language}.`;
  }

  return `OFFICIAL DIRECTIVE: ${sot.topic.toUpperCase()}
Target Recipient: ${role} | Format: ${format}
Venues: ${locs} | Active Window: ${dates}
Requirements: ${warns}
Actions: ${instrs}
Liaison: ${contacts}
Dispatched via ${channel} in ${language}.`;
}

export const generationService = {
  async generate(
    sot: SourceOfTruth,
    roles: string[],
    formats: string[],
    languages: string[],
    channels: string[],
    _forceDemo: boolean = false
  ): Promise<GeneratedContent[]> {
    // Attempt backend generation endpoint first
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles,
          formats,
          languages,
          channels,
          source_of_truth: sot
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      console.warn('Backend generate API unreachable, utilizing client generation engine.');
    }

    // Local deterministic generation fallback
    const results: GeneratedContent[] = [];
    for (const role of roles) {
      for (const format of formats) {
        for (const language of languages) {
          for (const channel of channels) {
            const content = createLocalContent(sot, role, format, language, channel);
            results.push({
              id: `gen-${Math.random().toString(36).substring(2, 9)}`,
              role,
              format,
              language,
              channel,
              content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        }
      }
    }

    return results;
  },

  async regenerateSingle(
    sot: SourceOfTruth,
    role: string,
    format: string,
    language: string,
    channel: string
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: [role],
          formats: [format],
          languages: [language],
          channels: [channel],
          source_of_truth: sot
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data[0].content;
        }
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 300));
    return createLocalContent(sot, role, format, language, channel);
  }
};
