import requests
import sys
import io
import docx
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://localhost:8000/api"

BLOOD_DONATION_TEXT = """PUBLIC HEALTH BLOOD DONATION CAMP

A blood donation camp will be conducted on September 15 at Government Community Hall from 9:00 AM to 2:00 PM.

Adults between 18 and 60 years of age may participate.

Participants should carry a valid identification document.

For assistance, contact health helpline 104."""

print("1. Testing /health...")
res = requests.get(f"{BASE}/health")
health_data = res.json()
print("Health status:", res.status_code, health_data)
assert res.status_code == 200
assert health_data.get("provider") in ["LocalLLMProvider", "DemoProvider"]
assert health_data.get("mode") in ["local", "fallback"]

print("\n2. Testing /extract on Official Demo Directive...")
extract_payload = {
    "text": "Heavy rainfall is expected in District A, District B and District C from August 23–25. Fishermen should not venture into the sea. Emergency response teams should remain active."
}
res = requests.post(f"{BASE}/extract", json=extract_payload)
print("Extract status:", res.status_code)
sot_demo = res.json()
print("Extracted Demo Topic:", sot_demo.get("topic"))
print("Extracted Demo Locations:", sot_demo.get("locations"))
print("Extracted Demo Dates:", sot_demo.get("dates"))
assert res.status_code == 200
assert sot_demo.get("topic") == "Heavy Rainfall Warning"
assert "District C" in sot_demo.get("locations")

print("\n3. Testing /extract on Custom Blood Donation Text...")
res = requests.post(f"{BASE}/extract", json={"text": BLOOD_DONATION_TEXT})
print("Custom Extract status:", res.status_code)
sot_custom = res.json()
print("Extracted Custom Topic:", sot_custom.get("topic"))
print("Extracted Custom Locations:", sot_custom.get("locations"))
print("Extracted Custom Dates:", sot_custom.get("dates"))
print("Extracted Custom Warnings:", sot_custom.get("warnings"))
print("Extracted Custom Instructions:", sot_custom.get("instructions"))
print("Extracted Custom Contacts:", sot_custom.get("contact"))
assert res.status_code == 200
assert "Blood Donation" in sot_custom.get("topic")
assert any("Government Community Hall" in l for l in sot_custom.get("locations"))
assert any("September 15" in d for d in sot_custom.get("dates"))
assert "rainfall" not in sot_custom.get("topic").lower()

print("\n4. Testing /upload with REAL TXT file...")
txt_bytes = BLOOD_DONATION_TEXT.encode("utf-8")
files = {"file": ("blood_donation.txt", io.BytesIO(txt_bytes), "text/plain")}
res = requests.post(f"{BASE}/upload", files=files)
print("Upload TXT status:", res.status_code)
assert res.status_code == 200
data_txt = res.json()
assert data_txt["file_type"] == "TXT"
assert "Government Community Hall" in data_txt["extracted_text"]
assert "Blood Donation" in data_txt["source_of_truth"]["topic"]
print("  ✓ TXT Upload & Extraction verified successfully")

print("\n5. Testing /upload with REAL PDF file...")
pdf_buf = io.BytesIO()
c = canvas.Canvas(pdf_buf, pagesize=letter)
c.drawString(100, 750, "PUBLIC HEALTH BLOOD DONATION CAMP")
c.drawString(100, 720, "A blood donation camp will be conducted on September 15 at Government Community Hall from 9:00 AM to 2:00 PM.")
c.drawString(100, 690, "Adults between 18 and 60 years of age may participate.")
c.drawString(100, 660, "Participants should carry a valid identification document.")
c.drawString(100, 630, "For assistance, contact health helpline 104.")
c.save()
pdf_bytes = pdf_buf.getvalue()

files = {"file": ("blood_donation.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
res = requests.post(f"{BASE}/upload", files=files)
print("Upload PDF status:", res.status_code)
assert res.status_code == 200
data_pdf = res.json()
assert data_pdf["file_type"] == "PDF"
assert "Government Community Hall" in data_pdf["extracted_text"]
assert "September 15" in data_pdf["extracted_text"]
assert "Blood Donation" in data_pdf["source_of_truth"]["topic"]
print("  ✓ PDF Upload & Extraction verified successfully")

print("\n6. Testing /upload with REAL DOCX file...")
doc = docx.Document()
doc.add_heading("PUBLIC HEALTH BLOOD DONATION CAMP", level=1)
doc.add_paragraph("A blood donation camp will be conducted on September 15 at Government Community Hall from 9:00 AM to 2:00 PM.")
doc.add_paragraph("Adults between 18 and 60 years of age may participate.")
doc.add_paragraph("Participants should carry a valid identification document.")
doc.add_paragraph("For assistance, contact health helpline 104.")
docx_buf = io.BytesIO()
doc.save(docx_buf)
docx_bytes = docx_buf.getvalue()

files = {"file": ("blood_donation.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
res = requests.post(f"{BASE}/upload", files=files)
print("Upload DOCX status:", res.status_code)
assert res.status_code == 200
data_docx = res.json()
assert data_docx["file_type"] == "DOCX"
assert "Government Community Hall" in data_docx["extracted_text"]
assert "Blood Donation" in data_docx["source_of_truth"]["topic"]
print("  ✓ DOCX Upload & Extraction verified successfully")

print("\n7. Testing /generate on Custom Blood Donation Source of Truth...")
gen_custom_payload = {
    "roles": ["Citizen", "Field Officer"],
    "formats": ["Public Advisory", "Action Checklist"],
    "languages": ["English", "Tamil", "Hindi"],
    "channels": ["WhatsApp"],
    "source_of_truth": data_txt["source_of_truth"]
}
res = requests.post(f"{BASE}/generate", json=gen_custom_payload)
print("Generate custom status:", res.status_code)
assert res.status_code == 200
custom_deliverables = res.json()
print("Generated custom count:", len(custom_deliverables))
for item in custom_deliverables:
    print(f" - [{item['role']} | {item['format']} | {item['language']}]: {item['content'][:60]}...")
    # Verify NO rainfall or District A/B/C appears in custom deliverables
    assert "rainfall" not in item["content"].lower(), "Rainfall found in Blood Donation deliverable!"
    assert "district a" not in item["content"].lower(), "District A found in Blood Donation deliverable!"
    assert "fishermen" not in item["content"].lower(), "Fishermen found in Blood Donation deliverable!"

print("\n8. Testing /validate on clean custom output...")
val_clean_payload = {
    "source_of_truth": data_txt["source_of_truth"],
    "generated_content": custom_deliverables[0]["content"]
}
res = requests.post(f"{BASE}/validate", json=val_clean_payload)
print("Validate clean status:", res.status_code, res.json())
assert res.status_code == 200
assert res.json()["status"] == "PASS"

print("\n9. Testing /validate on flawed custom output (missing location and date)...")
flawed_custom_text = "Public notice: Blood donation event. Bring your friends."
val_flawed_payload = {
    "source_of_truth": data_txt["source_of_truth"],
    "generated_content": flawed_custom_text
}
res = requests.post(f"{BASE}/validate", json=val_flawed_payload)
print("Validate flawed status:", res.status_code, res.json())
assert res.status_code == 200
assert res.json()["status"] == "REVIEW"
assert len(res.json()["missing_facts"]) > 0

print("\n10. Testing Demo Mode Regression (Rainfall)...")
demo_gen_payload = {
    "roles": ["Citizen"],
    "formats": ["Public Advisory"],
    "languages": ["Tamil"],
    "channels": ["WhatsApp"],
    "source_of_truth": sot_demo
}
res = requests.post(f"{BASE}/generate", json=demo_gen_payload)
assert res.status_code == 200
demo_item = res.json()[0]
assert "மழை" in demo_item["content"] or "District" in demo_item["content"]
print("  ✓ Demo rainfall generation verified")

print("\n==================================================")
print("ALL BACKEND & UPLOAD TESTS PASSED SUCCESSFULLY!")
print("==================================================")
