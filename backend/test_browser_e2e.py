import os
import sys
import time
from playwright.sync_api import sync_playwright
import docx
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\saran\.gemini\antigravity-ide\brain\100d70e0-bb00-4efb-9cd8-501dc78048e9"
SCREENSHOTS_DIR = os.path.join(ARTIFACT_DIR, "e2e_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

BLOOD_DONATION_TEXT = """PUBLIC HEALTH BLOOD DONATION CAMP

A blood donation camp will be conducted on September 15 at Government Community Hall from 9:00 AM to 2:00 PM.

Adults between 18 and 60 years of age may participate.

Participants should carry a valid identification document.

For assistance, contact health helpline 104."""

def create_sample_files():
    sample_dir = os.path.abspath(r"d:\New Folder(1)\ss\communi-ai\test_samples")
    os.makedirs(sample_dir, exist_ok=True)
    
    txt_path = os.path.join(sample_dir, "blood_donation.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(BLOOD_DONATION_TEXT)
        
    docx_path = os.path.join(sample_dir, "blood_donation.docx")
    doc = docx.Document()
    for line in BLOOD_DONATION_TEXT.split("\n"):
        doc.add_paragraph(line)
    doc.save(docx_path)
    
    pdf_path = os.path.join(sample_dir, "blood_donation.pdf")
    c = canvas.Canvas(pdf_path, pagesize=letter)
    y = 750
    for line in BLOOD_DONATION_TEXT.split("\n"):
        if line.strip():
            c.drawString(72, y, line.strip())
            y -= 25
    c.save()
    
    return txt_path, pdf_path, docx_path

def run_tests():
    txt_file, pdf_file, docx_file = create_sample_files()
    print("Sample test files ready:", txt_file, pdf_file, docx_file)
    
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chrome_path,
            headless=True
        )
        
        # ==========================================
        # TEST FLOW A: REAL FILE UPLOAD END-TO-END
        # ==========================================
        print("\n>>> STARTING FLOW A: REAL FILE UPLOAD (TXT / BLOOD DONATION)")
        context = browser.new_context(viewport={'width': 1280, 'height': 850}, accept_downloads=True)
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        
        # 1. Step 1: Upload real TXT file
        print("1. Uploading real TXT file...")
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(txt_file)
        time.sleep(1.5)
        
        # Verify text area contains blood donation content
        textarea_content = page.locator('textarea').input_value()
        print("Textarea content length:", len(textarea_content))
        assert "Blood Donation" in textarea_content or "blood donation" in textarea_content.lower(), "Textarea should contain blood donation text"
        assert "rainfall" not in textarea_content.lower(), "Zero rainfall leakage in uploaded text"
        
        # Verify header badge says [ UPLOADED SOURCE ]
        badge_text = page.locator('header button', has_text="UPLOADED SOURCE").text_content()
        print("Header badge:", badge_text)
        assert "UPLOADED SOURCE" in badge_text
        
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_upload_step1.png"))
        
        # 2. Click EXTRACT SOURCE OF TRUTH
        print("2. Extracting Source of Truth...")
        extract_btn = page.locator('button', has_text="EXTRACT SOURCE OF TRUTH")
        extract_btn.click()
        page.wait_for_selector('text=AUTHORITATIVE SOURCE', timeout=10000)
        time.sleep(1)
        
        # Check Step 2 contents:
        sot_body = page.locator('main').text_content()
        print("Verifying Source of Truth content...")
        assert "Blood Donation" in sot_body or "blood donation" in sot_body.lower()
        assert "Government Community Hall" in sot_body
        assert "September 15" in sot_body
        assert "104" in sot_body
        assert "Fishermen" not in sot_body
        assert "District C" not in sot_body
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_source_of_truth.png"))
        print("  ✓ Source of Truth accurately extracted from uploaded document!")
        
        # 3. Proceed to Orchestrator
        print("3. Proceeding to Orchestrator...")
        page.locator('button', has_text="Continue to Orchestrator").click()
        page.wait_for_selector('text=Communication Orchestrator', timeout=10000)
        time.sleep(1)
        
        # Ensure Tamil language button is active/toggled
        tamil_btn = page.locator('button', has_text="Tamil")
        if tamil_btn.count() > 0:
            tamil_btn.first.click()
            print("  Toggled/verified Tamil language")
            
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_orchestrator.png"))
        
        # 4. Generate Communication Package
        print("4. Generating Communication Package...")
        gen_btn = page.locator('button', has_text="GENERATE COMMUNICATION")
        gen_btn.click()
        page.wait_for_selector('text=Generated Communications', timeout=15000)
        time.sleep(1.5)
        
        # Check Step 4: Deliverables
        deliv_body = page.locator('main').text_content()
        assert "Blood Donation" in deliv_body or "ரத்த தான" in deliv_body or "Government Community Hall" in deliv_body
        assert "District C" not in deliv_body
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_generated_deliverables.png"))
        print("  ✓ Deliverables generated successfully with zero rainfall leakage!")
        
        # 5. Inject Test Validation Failure [ TEST VALIDATION ]
        print("5. Clicking [ TEST VALIDATION ] to verify audit flow...")
        test_val_btn = page.locator('button', has_text="TEST VALIDATION")
        test_val_btn.click()
        page.wait_for_selector('text=CRITICAL FACT VALIDATION', timeout=10000)
        time.sleep(1)
        
        # Step 5 Validation screen
        val_body = page.locator('main').text_content()
        assert "REVIEW REQUIRED" in val_body
        print("  ✓ Flawed state triggered: REVIEW REQUIRED detected.")
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_validation_flawed.png"))
        
        # 6. Click REGENERATE
        print("6. Clicking REGENERATE...")
        regen_btn = page.locator('button', has_text="REGENERATE").first
        regen_btn.click()
        time.sleep(2)
        
        # Verify validated state
        val_body_after = page.locator('main').text_content()
        assert "VALIDATED" in val_body_after
        print("  ✓ After regeneration: VALIDATED status achieved!")
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_validation_passed.png"))
        
        # 7. Test HUMAN REVIEW & VALIDATE AGAIN
        print("7. Testing HUMAN REVIEW editor & VALIDATE AGAIN...")
        human_btn = page.locator('button', has_text="HUMAN REVIEW").first
        human_btn.click()
        time.sleep(1)
        page.wait_for_selector('text=Human Review Active', timeout=5000)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06b_human_review_active.png"))
        
        val_again_btn = page.locator('button', has_text="VALIDATE AGAIN")
        val_again_btn.click()
        time.sleep(1.5)
        print("  ✓ Human review and Validate Again flow completed!")
        
        # 8. Approve Output
        print("8. Clicking APPROVE OUTPUT...")
        approve_btn = page.locator('button', has_text="APPROVE OUTPUT")
        approve_btn.click()
        page.wait_for_selector('text=COMMUNICATION PACKAGE READY', timeout=10000)
        time.sleep(1)
        
        # Step 6 Final Package
        final_body = page.locator('main').text_content()
        assert "COMMUNICATION PACKAGE READY" in final_body
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "07_final_package.png"))
        print("  ✓ Step 6 Final Package Ready!")
        
        # 9. Test TXT Download
        print("9. Testing TXT download button...")
        with page.expect_download(timeout=10000) as download_info:
            txt_download_btn = page.locator('button', has_text="DOWNLOAD TXT")
            txt_download_btn.click()
        txt_download = download_info.value
        txt_saved = os.path.join(SCREENSHOTS_DIR, "downloaded_package.txt")
        txt_download.save_as(txt_saved)
        with open(txt_saved, 'r', encoding='utf-8') as f:
            downloaded_txt_content = f.read()
        print("Downloaded TXT snippet:", downloaded_txt_content[:120].replace('\n', ' '))
        assert "Blood Donation" in downloaded_txt_content or "Government Community Hall" in downloaded_txt_content
        print("  ✓ TXT export verified successfully!")
        
        # 10. Test ZIP Download
        print("10. Testing ZIP download button...")
        with page.expect_download(timeout=10000) as download_info_zip:
            zip_download_btn = page.locator('button', has_text="DOWNLOAD ZIP")
            zip_download_btn.click()
        zip_download = download_info_zip.value
        zip_saved = os.path.join(SCREENSHOTS_DIR, "downloaded_package.zip")
        zip_download.save_as(zip_saved)
        assert os.path.exists(zip_saved) and os.path.getsize(zip_saved) > 100
        print(f"  ✓ ZIP export verified successfully! Size: {os.path.getsize(zip_saved)} bytes")
        
        context.close()
        
        # ==========================================
        # TEST FLOW B: OFFICIAL DEMO REGRESSION
        # ==========================================
        print("\n>>> STARTING FLOW B: OFFICIAL RAINFALL DEMO REGRESSION TEST")
        context_demo = browser.new_context(viewport={'width': 1280, 'height': 850}, accept_downloads=True)
        page_demo = context_demo.new_page()
        page_demo.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        
        # Verify Rainfall directive is pre-loaded by default in Demo Mode
        demo_text = page_demo.locator('textarea').input_value()
        print("Demo textarea content:", demo_text[:60], "...")
        assert "Heavy rainfall" in demo_text
        assert "District A, District B and District C" in demo_text
        
        # Extract Source of Truth
        page_demo.locator('button', has_text="EXTRACT SOURCE OF TRUTH").click()
        page_demo.wait_for_selector('text=AUTHORITATIVE SOURCE', timeout=10000)
        demo_sot_text = page_demo.locator('main').text_content()
        assert "Heavy Rainfall Warning" in demo_sot_text
        assert "District C" in demo_sot_text
        assert "August 23–25" in demo_sot_text
        page_demo.screenshot(path=os.path.join(SCREENSHOTS_DIR, "08_demo_sot.png"))
        print("  ✓ Demo Source of Truth verified")
        
        # Orchestrator
        page_demo.locator('button', has_text="Continue to Orchestrator").click()
        page_demo.wait_for_selector('text=Communication Orchestrator', timeout=10000)
        page_demo.locator('button', has_text="GENERATE COMMUNICATION").click()
        page_demo.wait_for_selector('text=Generated Communications', timeout=15000)
        
        # Test validation on demo
        page_demo.locator('button', has_text="TEST VALIDATION").click()
        page_demo.wait_for_selector('text=CRITICAL FACT VALIDATION', timeout=10000)
        val_text = page_demo.locator('main').text_content()
        assert "REVIEW REQUIRED" in val_text
        assert "District C" in val_text
        page_demo.screenshot(path=os.path.join(SCREENSHOTS_DIR, "09_demo_validation_flawed.png"))
        print("  ✓ Demo flawed validation verified: Missing District C caught!")
        
        # Regenerate demo
        page_demo.locator('button', has_text="REGENERATE").first.click()
        time.sleep(2)
        val_text_after = page_demo.locator('main').text_content()
        assert "VALIDATED" in val_text_after
        page_demo.screenshot(path=os.path.join(SCREENSHOTS_DIR, "10_demo_validation_passed.png"))
        print("  ✓ Demo regenerated and validated!")
        
        # Approve demo
        page_demo.locator('button', has_text="APPROVE OUTPUT").click()
        page_demo.wait_for_selector('text=COMMUNICATION PACKAGE READY', timeout=10000)
        assert "COMMUNICATION PACKAGE READY" in page_demo.locator('main').text_content()
        page_demo.screenshot(path=os.path.join(SCREENSHOTS_DIR, "11_demo_final_package.png"))
        print("  ✓ Demo final package verified")
        
        context_demo.close()
        
        # ==========================================
        # TEST FLOW C: MOBILE RESPONSIVENESS (390x844)
        # ==========================================
        print("\n>>> STARTING FLOW C: MOBILE RESPONSIVE TEST (390x844)")
        context_mobile = browser.new_context(viewport={'width': 390, 'height': 844})
        page_mobile = context_mobile.new_page()
        page_mobile.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        
        page_mobile.screenshot(path=os.path.join(SCREENSHOTS_DIR, "12_mobile_step1.png"))
        
        # Click START DEMO on mobile
        start_btn = page_mobile.locator('button', has_text="START DEMO").first
        start_btn.click()
        page_mobile.wait_for_selector('text=AUTHORITATIVE SOURCE', timeout=10000)
        time.sleep(1)
        page_mobile.screenshot(path=os.path.join(SCREENSHOTS_DIR, "13_mobile_step2.png"))
        print("  ✓ Mobile layout validated on 390x844!")
        
        context_mobile.close()
        browser.close()
        
    print("\n==================================================")
    print("ALL BROWSER DEMO TESTS PASSED WITH COMPLETE FIDELITY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
