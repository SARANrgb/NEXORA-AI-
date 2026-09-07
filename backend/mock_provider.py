import re
from llm_provider import LLMProvider
from models import SourceOfTruth, ValidationResult

DEMO_RAINFALL_TOPIC = "Heavy Rainfall Warning"

class MockProvider(LLMProvider):
    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        text_clean = text.strip()
        text_lower = text_clean.lower()

        # -------------------------------------------------------------
        # 1. OFFICIAL DEMO RAINFALL DIRECTIVE SHORT-CIRCUIT
        # -------------------------------------------------------------
        if "heavy rainfall" in text_lower and ("district a" in text_lower or "august 23" in text_lower or "fishermen" in text_lower):
            return SourceOfTruth(
                topic="Heavy Rainfall Warning",
                key_facts=[
                    "Heavy rainfall expected across coastal and inland regions",
                    "High potential for waterlogging and disruption of essential services",
                    "Precautionary flood monitoring initiated"
                ],
                dates=["August 23–25"],
                numbers=["August 23–25", "3 Districts"],
                locations=["District A", "District B", "District C"],
                entities=["Fishermen", "Emergency response teams", "District Administration"],
                instructions=["Emergency response teams should remain active."],
                warnings=["Fishermen should not venture into the sea."],
                context="Official Meteorological Directive & Emergency Response Advisory",
                contact=["Emergency Control Room: 1077"],
                constraints=["Maritime ban active for 72 hours"]
            )

        # -------------------------------------------------------------
        # 2. GENERAL DYNAMIC EXTRACTION ENGINE FOR REAL UPLOADS
        # -------------------------------------------------------------
        lines = [l.strip() for l in text_clean.splitlines() if l.strip()]
        
        # Topic Extraction:
        # Check first non-empty line as candidate heading
        topic = "Public Notice & Directive"
        if lines:
            first_line = lines[0]
            # Strip markdown formatting
            first_line = re.sub(r'^[#*_\-\s]+', '', first_line).strip()
            if len(first_line) <= 70 and not first_line.endswith('.'):
                topic = first_line.title()
            else:
                # Search for title-like phrase before colon or in first sentence
                colon_split = first_line.split(':', 1)
                if len(colon_split) > 1 and len(colon_split[0]) < 40:
                    topic = colon_split[0].strip().title()
                else:
                    topic = first_line[:50].strip().title()

        # Dates Extraction:
        dates = []
        month_pattern = r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]* \d{1,2}(?:(?:–|-| to )\d{1,2})?(?:, \d{4})?\b'
        for m in re.finditer(month_pattern, text_clean, re.I):
            date_val = m.group(0).strip()
            if date_val not in dates:
                dates.append(date_val)
        
        # Numeric date fallback (e.g. 15/09/2026 or 15-09-2026)
        if not dates:
            numeric_dates = re.findall(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text_clean)
            for nd in numeric_dates:
                if nd not in dates:
                    dates.append(nd)

        # Times Extraction:
        times = re.findall(r'\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\s*(?:to|–|-)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b', text_clean)
        
        # Locations Extraction:
        locations = []
        # Pattern 1: Look for venue landmarks (Hall, Center, Hospital, School, Ground, Building, etc.)
        venue_matches = re.finditer(r'(?:at|in|venue:?)\s+([A-Z][A-Za-z0-9\s]+(?:Hall|Center|Centre|Hospital|Ground|Room|Auditorium|Complex|Building|Campus|Station|Office|Clinic|Bank|Club))\b', text_clean)
        for vm in venue_matches:
            v_name = vm.group(1).strip()
            if v_name and v_name not in locations:
                locations.append(v_name)
        
        # Pattern 2: Specific districts/cities if mentioned
        for place in ["District A", "District B", "District C", "District D", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Kolkata"]:
            if re.search(r'\b' + re.escape(place) + r'\b', text_clean, re.I):
                if place not in locations:
                    locations.append(place)

        # Numbers Extraction:
        numbers = []
        if times:
            numbers.extend(times)
        # Age ranges or numeric intervals
        age_matches = re.findall(r'\b\d{1,2}\s*(?:and|to|–|-)\s*\d{1,2}\b', text_clean)
        for am in age_matches:
            if am not in numbers:
                numbers.append(am)
        # Phone numbers / helplines
        contact_nums = re.findall(r'(?:helpline|contact|phone|call|dial|toll[- ]free|mobile)\s*(?:is|at|:)?\s*([0-9]{3,12})', text_clean, re.I)
        for cn in contact_nums:
            if cn not in numbers:
                numbers.append(cn)

        # Contacts Extraction:
        contacts = []
        for cn in contact_nums:
            contacts.append(f"Helpline: {cn}")
        email_matches = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text_clean)
        for em in email_matches:
            contacts.append(f"Email: {em}")

        # Sentence Splitting for Warnings and Instructions:
        sentences = [s.strip() for s in re.split(r'[.\n]+', text_clean) if len(s.strip()) > 8]

        warnings = []
        instructions = []

        warning_keywords = ['warning', 'caution', 'alert', 'should not', 'must not', 'do not', 'avoid', 'mandatory', 'carry a valid', 'between 18 and 60', 'eligibility', 'eligible', 'prohibited']
        instruction_keywords = ['conducted', 'held', 'participate', 'should', 'must', 'remain active', 'contact', 'call', 'register', 'carry', 'bring', 'report', 'follow', 'visit']

        for s in sentences:
            s_lower = s.lower()
            if any(k in s_lower for k in warning_keywords):
                # Format clean sentence
                clean_s = s.strip()
                if not clean_s.endswith('.'):
                    clean_s += '.'
                if clean_s not in warnings:
                    warnings.append(clean_s)
            elif any(k in s_lower for k in instruction_keywords):
                clean_s = s.strip()
                if not clean_s.endswith('.'):
                    clean_s += '.'
                if clean_s not in instructions:
                    instructions.append(clean_s)

        # Fallback values if specific clauses weren't detected
        if not dates:
            dates = ["Immediate Notice"]
        if not locations:
            locations = ["Designated Municipal Facility"]
        if not warnings:
            warnings = ["Participants must comply with all official eligibility criteria and safety regulations."]
        if not instructions:
            instructions = [f"Refer to designated liaison officers for operational execution regarding {topic}."]
        if not contacts:
            contacts = ["Official Inquiries Desk"]

        key_facts = []
        for s in sentences[:4]:
            clean_fact = s.strip()
            if len(clean_fact) > 12:
                key_facts.append(clean_fact)
        if not key_facts:
            key_facts = [f"{topic} scheduled across {', '.join(locations)} effective {', '.join(dates)}."]

        entities = []
        for loc in locations:
            if loc not in entities:
                entities.append(loc)
        for cn in contacts:
            if cn not in entities:
                entities.append(cn)
        if "Participants" not in entities:
            entities.append("Public & Program Participants")

        return SourceOfTruth(
            topic=topic,
            key_facts=key_facts,
            dates=dates,
            numbers=numbers if numbers else dates,
            locations=locations,
            entities=entities,
            instructions=instructions,
            warnings=warnings,
            context="Extracted from Authoritative User Document",
            contact=contacts,
            constraints=["Verification of credentials and protocol adherence required"]
        )

    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        locs = ", ".join(sot.locations)
        dates_str = ", ".join(sot.dates)
        warns = " ".join(sot.warnings)
        instrs = " ".join(sot.instructions)
        contacts_str = ", ".join(sot.contact) if sot.contact else "Designated Helpdesk"

        # Check if this is the rainfall directive
        is_rainfall = "rainfall" in sot.topic.lower() or "sea" in warns.lower()

        # -------------------------------------------------------------
        # TAMIL GENERATION
        # -------------------------------------------------------------
        if language == "Tamil":
            if is_rainfall:
                if role == "Citizen" and format == "Public Advisory":
                    return f"""🔴 பொது எச்சரிக்கை அறிவிப்பு | {sot.topic}

பகுதிகள்: {locs}
காலம்: {dates_str}

முக்கிய எச்சரிக்கை:
⚠️ {warns}

அறிவுறுத்தல்கள்:
• {instrs}
• அத்தியாவசிய தேவைகள் இன்றி வெளியே செல்ல வேண்டாம்.
• உள்ளூர் நிர்வாகத்தின் எச்சரிக்கைகளை தொடர்ந்து கவனிக்கவும்.

ஊடகம்: {channel} | அங்கீகரிக்கப்பட்ட தகவல் மூலம்: Nexora AI"""
                elif role == "Field Officer":
                    return f"""📋 கள அலுவலர் செயல்முறைப் பட்டியல் | {sot.topic}
இடம்: {locs} | காலம்: {dates_str}

செயல்பாடுகள்:
1. {instrs}
2. கடலோரப் பகுதிகளில் {warns} தீவிரமாக கண்காணிக்கவும்.
3. அவசரகால முகாம்கள் மற்றும் படகுகளை தயார் நிலையில் வைக்கவும்.
4. தகவல்களை {channel} மூலம் உடனுக்குடன் பகிரவும்."""
                else:
                    return f"""அதிகாரப்பூர்வ தகவல் அறிக்கை ({role} - {format})
பொருள்: {sot.topic}
பகுதிகள்: {locs} ({dates_str})
எச்சரிக்கை: {warns}
நடவடிக்கை: {instrs}
அனுப்பப்படும் முறை: {channel}"""
            else:
                # Generic / Uploaded Source (e.g. Blood Donation Camp)
                tamil_topic = "ரத்த தான முகாம்" if "blood" in sot.topic.lower() else sot.topic
                if role == "Citizen" and format == "Public Advisory":
                    return f"""🔴 பொது நல அறிவிப்பு | {tamil_topic} ({sot.topic})

இடம்: {locs}
நடைபெறும் நாள்: {dates_str}

முக்கிய தகவல்கள் & தகுதி வரம்பு:
⚠️ {warns}

பங்கேற்பாளர்களுக்கான அறிவுறுத்தல்கள்:
• {instrs}
• உதவி மற்றும் விபரங்களுக்கு தொடர்பு கொள்ளவும்: {contacts_str}
• அனைவரும் பங்கேற்று நல்வாழ்வு திட்டத்திற்கு ஆதரவளிக்க கேட்டுக்கொள்ளப்படுகிறார்கள்.

வழங்கப்படும் ஊடகம்: {channel} | அதிகாரப்பூர்வ ஆதாரம்: Nexora AI"""
                elif role == "Field Officer":
                    return f"""📋 கள அலுவலர் செயல்முறைப் பட்டியல் | {tamil_topic}
இடம்: {locs} | நாள்: {dates_str}

கள அலுவலர் பணிகள்:
1. {instrs}
2. {warns} - விதிமுறைகளை உறுதி செய்க.
3. உதவி எண் {contacts_str} தொடர்பை பராமரிக்கவும்.
4. நிகழ்வு முன்னேற்றங்களை {channel} வழியாக தலைமைக்கு சமர்ப்பிக்கவும்."""
                else:
                    return f"""அதிகாரப்பூர்வ தகவல் அறிக்கை ({role} - {format})
நிகழ்வு: {tamil_topic} ({sot.topic})
இடம்: {locs} | நாள்: {dates_str}
விதிமுறைகள்: {warns}
வழிகாட்டுதல்: {instrs}
தொடர்பு: {contacts_str} | ஊடகம்: {channel}"""

        # -------------------------------------------------------------
        # HINDI GENERATION
        # -------------------------------------------------------------
        elif language == "Hindi":
            hindi_topic = "रक्तदान शिविर" if "blood" in sot.topic.lower() else sot.topic
            if is_rainfall:
                return f"""🔴 सार्वजनिक सुरक्षा परामर्श | {sot.topic}

स्थान: {locs}
प्रभावी तिथियां: {dates_str}

मुख्य चेतावनी:
⚠️ {warns}

नागरिकों हेतु निर्देश:
• {instrs}
• निचले इलाकों और जलभराव वाले मार्गों से दूर रहें।
• आपातकालीन संपर्क नंबर तैयार रखें।

प्रसारण माध्यम: {channel} | अधिकृत स्रोत: Nexora AI"""
            else:
                return f"""🔴 आधिकारिक जन सूचना | {hindi_topic} ({sot.topic})

स्थान: {locs}
तिथि व समय: {dates_str}

आवश्यक दिशानिर्देश व पात्रता:
⚠️ {warns}

प्रतिभागियों के लिए निर्देश:
• {instrs}
• पूछताछ एवं सहायता हेतु संपर्क करें: {contacts_str}
• कृपया समय पर उपस्थित होकर कार्यक्रम को सफल बनाएं।

प्रसारण माध्यम: {channel} | प्राधिकृत स्रोत: Nexora AI"""

        # -------------------------------------------------------------
        # TELUGU, MALAYALAM, KANNADA GENERATION
        # -------------------------------------------------------------
        elif language == "Telugu":
            return f"""🔴 అధికారిక సమాచారం ({role} - {format})
విషయం: {sot.topic}
ప్రాంతం: {locs} ({dates_str})
హెచ్చరిక / మార్గదర్శకాలు: {warns}
చర్యలు: {instrs}
సంప్రదించండి: {contacts_str} | ఛానెల్: {channel}"""

        elif language == "Malayalam":
            return f"""🔴 ഔദ്യോഗിക അറിയിപ്പ് ({role} - {format})
വിഷയം: {sot.topic}
സ്ഥലം: {locs} ({dates_str})
നിർദ്ദേശങ്ങൾ: {warns}
നടപടികൾ: {instrs}
സഹായത്തിന്: {contacts_str} | മാധ്യമം: {channel}"""

        elif language == "Kannada":
            return f"""🔴 ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ ({role} - {format})
ವಿಷಯ: {sot.topic}
ಸ್ಥಳ: {locs} ({dates_str})
ಎಚ್ಚರಿಕೆ / ಮಾರ್ಗಸೂಚಿಗಳು: {warns}
ಕ್ರಮಗಳು: {instrs}
ಸಂಪರ್ಕಿಸಿ: {contacts_str} | ಮಾಧ್ಯಮ: {channel}"""

        # -------------------------------------------------------------
        # ENGLISH GENERATION
        # -------------------------------------------------------------
        if format == "Executive Summary" or role == "Senior Official":
            return f"""EXECUTIVE BRIEFING: {sot.topic.upper()}
Target: {role} | Classification: Operational Directive | Channel: {channel}

1. EXECUTIVE OVERVIEW
Official initiative scheduled for {locs} effective {dates_str}.

2. MANDATORY PROTOCOLS & GUIDELINES
- {warns}

3. ADMINISTRATIVE DIRECTIVES
- {instrs}
- Public inquiry & support liaison: {contacts_str}
- Dispatched via {channel} in {language}."""

        elif format == "Action Checklist" or role == "Field Officer":
            return f"""ACTION CHECKLIST // GROUND OPERATIONS
Target Role: {role} | Event: {sot.topic}
Operational Venue: {locs} | Window: {dates_str}

[ ] MANDATORY REQUIREMENT: Verify adherence: "{warns}"
[ ] LOGISTICS DEPLOYMENT: {instrs}
[ ] PUBLIC LIAISON: Ensure active coordination via {contacts_str}
[ ] REPORTING: Broadcast hourly operational updates through {channel}"""

        elif format == "Public Advisory" or role == "Citizen":
            return f"""URGENT PUBLIC ADVISORY: {sot.topic.upper()}
Venue / Location: {locs}
Date & Operational Time: {dates_str}

KEY REQUIREMENTS & NOTICE:
⚠️ {warns}

WHAT PARTICIPANTS & CITIZENS MUST DO:
• {instrs}
• For assistance or inquiries, please contact: {contacts_str}
• Broadcasted via {channel} for broad community awareness."""

        elif format == "Press Release" or role == "Media Team":
            return f"""FOR IMMEDIATE RELEASE: OFFICIAL STATEMENT ON {sot.topic.upper()}
Location: {locs} | Date: {dates_str}

GOVERNMENT COMMUNICATIONS DESK:
The administration announces that {sot.topic} will be conducted at {locs} on {dates_str}.

KEY NOTICE & ELIGIBILITY:
"{warns}"

OPERATIONAL READINESS:
{instrs}

Media inquiries and public support available via {contacts_str}. Dispatched via {channel}."""

        elif format == "Social Media Post" or role == "Social Media Team":
            hashtag_topic = re.sub(r'[^a-zA-Z0-9]', '', sot.topic)
            return f"""📢 #{hashtag_topic}
📍 Venue: {locs}
📅 Date & Time: {dates_str}

⚠️ Notice: {warns}
🛡️ Action: {instrs}

📞 Helpline: {contacts_str}
#PublicNotice #{channel.replace(' ', '')}"""

        else:
            return f"""OFFICIAL DIRECTIVE: {sot.topic}
Recipient: {role} | Format: {format}
Venue: {locs} | Scheduled: {dates_str}
Directives: {warns}
Instructions: {instrs}
Helpline: {contacts_str}
Transmitted via {channel} in {language}."""

    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        preserved = []
        missing = []
        altered = []

        # Check for the intentional demo failure pattern (Rainfall demo)
        is_flawed_rainfall = ("District C" not in generated_content and ("August 24" in generated_content or "until August 24" in generated_content)) or \
                             ("District C" not in generated_content and "District A" in generated_content and "District B" in generated_content and "fishermen" not in generated_content.lower())

        if is_flawed_rainfall:
            return ValidationResult(
                status="REVIEW",
                score=38,
                preserved_facts=["District A", "District B", "Heavy rainfall"],
                missing_facts=[
                    "Missing District C",
                    "Missing August 25",
                    "Missing fishermen warning",
                    "Missing emergency response instruction"
                ],
                altered_facts=["Dates altered from August 23–25 to ending on August 24"]
            )

        # Check for corrected demo rainfall pattern
        is_corrected_rainfall = "District C" in generated_content and ("August 23" in generated_content or "August 23–25" in generated_content or "23" in generated_content) and \
                               ("fishermen" in generated_content.lower() or "மீனவர்கள்" in generated_content or "मछुआरों" in generated_content or "emergency" in generated_content.lower())

        if is_corrected_rainfall and "rainfall" in sot.topic.lower():
            return ValidationResult(
                status="PASS",
                score=98,
                preserved_facts=[
                    "Dates: August 23–25 verified",
                    "Locations: District A, District B, District C verified",
                    "Warning: Fishermen restriction verified",
                    "Instruction: Emergency response teams active verified"
                ],
                missing_facts=[],
                altered_facts=[]
            )

        # Check for custom flawed pattern (e.g. missing location, missing date, missing contact)
        gen_lower = generated_content.lower()

        # Dates check
        for d in sot.dates:
            # Check date matching
            date_clean = re.sub(r'[^a-zA-Z0-9]', ' ', d).lower().split()
            matched = any(w in gen_lower for w in date_clean if len(w) > 2)
            if matched:
                preserved.append(f"Date Verified: {d}")
            else:
                missing.append(f"Date Missing: {d}")

        # Locations check
        for loc in sot.locations:
            loc_words = [w.lower() for w in re.sub(r'[^a-zA-Z0-9]', ' ', loc).split() if len(w) > 3]
            matched = any(w in gen_lower for w in loc_words) or loc.lower() in gen_lower
            if matched:
                preserved.append(f"Location Verified: {loc}")
            else:
                missing.append(f"Location Missing: {loc}")

        # Warnings / Requirements check
        for w in sot.warnings:
            # Extract key informative words (>4 chars)
            kwords = [word.lower() for word in re.findall(r'\b[A-Za-z0-9]{4,}\b', w) if word.lower() not in ['should', 'their', 'which', 'about', 'these', 'where']]
            if any(k in gen_lower for k in kwords) or any(k in generated_content for k in ['எச்சரிக்கை', 'चेतावनी', 'विपरங்கள்', 'தகுதி', 'வழிகாட்டுதல்']):
                preserved.append(f"Requirement/Warning Verified: {w[:40]}...")
            else:
                missing.append(f"Requirement/Warning Missing: {w[:40]}...")

        # Instructions check
        for i in sot.instructions:
            kwords = [word.lower() for word in re.findall(r'\b[A-Za-z0-9]{4,}\b', i) if word.lower() not in ['should', 'their', 'which', 'about', 'these', 'where']]
            if any(k in gen_lower for k in kwords) or any(k in generated_content for k in ['நடவடிக்கை', 'செயல்பாடுகள்', 'निर्देश', 'कार्यवाही']):
                preserved.append(f"Instruction Verified: {i[:40]}...")
            else:
                missing.append(f"Instruction Missing: {i[:40]}...")

        # Numbers / Helpline check
        if sot.contact:
            for c in sot.contact:
                nums = re.findall(r'\b\d{3,10}\b', c)
                if nums:
                    for num in nums:
                        if num in generated_content:
                            preserved.append(f"Contact Verified: {num}")
                        else:
                            missing.append(f"Contact Missing: {num}")

        # Topic check
        topic_words = [w.lower() for w in sot.topic.split() if len(w) > 3]
        if any(w in gen_lower for w in topic_words) or any(k in generated_content for k in ['ரத்த', 'ரத்ததான', 'रक्तदान', 'முகாம்', 'சிவிற']):
            preserved.append(f"Topic Preserved: {sot.topic}")
        else:
            missing.append(f"Topic Missing: {sot.topic}")

        is_pass = len(missing) == 0
        total_facts = max(1, len(preserved) + len(missing) + len(altered))
        score = 96 if is_pass else max(25, int((len(preserved) / total_facts) * 100))

        return ValidationResult(
            status="PASS" if is_pass else "REVIEW",
            score=score,
            preserved_facts=preserved,
            missing_facts=missing,
            altered_facts=altered
        )

DemoProvider = MockProvider
