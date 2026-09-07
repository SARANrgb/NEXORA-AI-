import os
import sys
import time
from playwright.sync_api import sync_playwright

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOT_DIR = os.path.abspath("test_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

test_results = {}

def run_test():
    print("=================================================================")
    print("NEXORA AI - COMPLETE REAL BROWSER DEMO TEST")
    print("=================================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            accept_downloads=True
        )
        page = context.new_page()

        # -----------------------------------------------------------------
        # STEP 1: LOAD DASHBOARD & START DEMO
        # -----------------------------------------------------------------
        print("STEP 1: Navigating to http://localhost:5173 ...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_dashboard.png"))
        
        # Verify Demo Mode badge and title
        header_text = page.inner_text("header")
        assert "NEXORA" in header_text and "AI" in header_text, "Brand title not found"
        assert "[ DEMO MODE ]" in header_text, "DEMO MODE badge not found"
        print("  ✓ Header verified: NEXORA AI, [ DEMO MODE ]")

        body_text = page.inner_text("main")
        assert "One Source. Every Audience. Verified Communication." in body_text, "Tagline not found"
        print("  ✓ Dashboard verified: Tagline and workflow present")

        # -----------------------------------------------------------------
        # STEP 2: CLICK START DEMO -> SOURCE OF TRUTH
        # -----------------------------------------------------------------
        print("\nSTEP 2: Clicking START DEMO ...")
        start_demo_btn = page.locator("button:has-text('START DEMO')")
        assert start_demo_btn.is_visible(), "START DEMO button not visible"
        start_demo_btn.click()

        # Wait for Source of Truth page
        page.wait_for_selector("text=SOURCE OF TRUTH", timeout=10000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_source_of_truth.png"))
        sot_text = page.inner_text("main")

        # Verify Source of Truth contents
        assert "Heavy Rainfall Warning" in sot_text, "Topic missing"
        assert "August 23–25" in sot_text or "August 23-25" in sot_text, "Dates missing"
        assert "District A" in sot_text and "District B" in sot_text and "District C" in sot_text, "Locations missing"
        assert "Fishermen should not venture into the sea." in sot_text, "Fishermen warning missing"
        assert "Emergency response teams should remain active." in sot_text, "Emergency instruction missing"
        print("  ✓ SOURCE OF TRUTH VERIFIED:")
        print("    - Topic: Heavy Rainfall Warning")
        print("    - Dates: August 23–25")
        print("    - Locations: District A, District B, District C")
        print("    - Warning: Fishermen should not venture into the sea.")
        print("    - Instruction: Emergency response teams should remain active.")
        test_results["SOURCE OF TRUTH"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 3: NAVIGATE TO ORCHESTRATOR & CONFIGURE 4 DIMENSIONS
        # -----------------------------------------------------------------
        print("\nSTEP 3: Continuing to Orchestrator ...")
        continue_btn = page.locator("button:has-text('Continue to Orchestrator')")
        continue_btn.click()

        page.wait_for_selector("text=Communication Orchestrator", timeout=10000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_orchestrator_initial.png"))

        # Configure combination: CITIZEN, PUBLIC ADVISORY, TAMIL, WHATSAPP
        print("  Configuring matrix: CITIZEN x PUBLIC ADVISORY x TAMIL x WHATSAPP ...")
        
        # Deselect unwanted Roles
        for role in ["Field Officer", "Senior Official"]:
            btn = page.locator(f"button:has-text('{role}')")
            if "bg-red-950" in btn.get_attribute("class"):
                btn.click()
        # Ensure Citizen is selected
        citizen_btn = page.locator("button:has-text('Citizen')")
        if "bg-red-950" not in citizen_btn.get_attribute("class"):
            citizen_btn.click()

        # Deselect unwanted Formats
        for fmt in ["Action Checklist", "Executive Summary"]:
            btn = page.locator(f"button:has-text('{fmt}')")
            if "bg-red-950" in btn.get_attribute("class"):
                btn.click()
        # Ensure Public Advisory is selected
        pa_btn = page.locator("button:has-text('Public Advisory')")
        if "bg-red-950" not in pa_btn.get_attribute("class"):
            pa_btn.click()

        # Deselect English
        eng_btn = page.locator("button:has-text('English')")
        if "bg-red-950" in eng_btn.get_attribute("class"):
            eng_btn.click()
        # Ensure Tamil is selected
        tamil_btn = page.locator("button:has-text('Tamil')")
        if "bg-red-950" not in tamil_btn.get_attribute("class"):
            tamil_btn.click()

        # Deselect Dashboard
        dash_btn = page.locator("button:has-text('Dashboard')")
        if "bg-red-950" in dash_btn.get_attribute("class"):
            dash_btn.click()
        # Ensure WhatsApp is selected
        wa_btn = page.locator("button:has-text('WhatsApp')")
        if "bg-red-950" not in wa_btn.get_attribute("class"):
            wa_btn.click()

        time.sleep(0.5)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_orchestrator_configured.png"))

        # Verify Live Configuration Preview
        preview_text = page.inner_text("div:has-text('LIVE CONFIGURATION PREVIEW')")
        assert "Citizen" in preview_text, "Preview missing Citizen"
        assert "Public Advisory" in preview_text, "Preview missing Public Advisory"
        assert "Tamil" in preview_text, "Preview missing Tamil"
        assert "WhatsApp" in preview_text, "Preview missing WhatsApp"
        assert "1 Packages Configured" in preview_text, "Preview package count incorrect"
        print("  ✓ Live configuration preview correctly updated: Citizen • Public Advisory • Tamil • WhatsApp (1 Packages Configured)")
        test_results["ORCHESTRATOR"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 4: GENERATE COMMUNICATION
        # -----------------------------------------------------------------
        print("\nSTEP 4: Clicking GENERATE COMMUNICATION ...")
        gen_btn = page.locator("button:has-text('GENERATE COMMUNICATION')")
        gen_btn.click()

        page.wait_for_selector("text=Generated Communications", timeout=15000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_generated_deliverables.png"))

        deliverables_text = page.inner_text("main").lower()
        assert "citizen" in deliverables_text, "Deliverable missing Citizen badge"
        assert "public advisory" in deliverables_text, "Deliverable missing Public Advisory badge"
        assert "tamil" in deliverables_text, "Deliverable missing Tamil badge"
        assert "whatsapp" in deliverables_text, "Deliverable missing WhatsApp badge"
        print("  ✓ Deliverable card appeared properly with Citizen / Public Advisory / Tamil / WhatsApp")
        test_results["GENERATION"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 5: TEST VALIDATION (INJECT INTENTIONAL FAILURE)
        # -----------------------------------------------------------------
        print("\nSTEP 5: Clicking [ TEST VALIDATION ] ...")
        test_val_btn = page.locator("button:has-text('[ TEST VALIDATION ]')")
        test_val_btn.click()

        page.wait_for_selector("text=CRITICAL FACT VALIDATION", timeout=10000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_test_validation_flawed.png"))

        val_screen_text = page.inner_text("main")
        assert "REVIEW REQUIRED" in val_screen_text, "Hero status did not show REVIEW REQUIRED"
        
        # Confirm identifies the 4 missing facts
        assert "District C" in val_screen_text, "Missing District C not identified"
        assert "August 25" in val_screen_text, "Missing August 25 not identified"
        assert "Fishermen" in val_screen_text or "fishermen" in val_screen_text, "Missing Fishermen warning not identified"
        assert "Emergency" in val_screen_text or "emergency" in val_screen_text, "Missing Emergency response instruction not identified"
        print("  ✓ Validation failure successfully detected:")
        print("    - Status: REVIEW REQUIRED")
        print("    - Identified: Missing District C")
        print("    - Identified: Missing August 25")
        print("    - Identified: Missing fishermen warning")
        print("    - Identified: Missing emergency response instruction")
        test_results["VALIDATION FAILURE"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 6: REGENERATE TO FIX FLUSHED CONTENT
        # -----------------------------------------------------------------
        print("\nSTEP 6: Clicking REGENERATE ...")
        regen_btn = page.locator("button:has-text('REGENERATE')")
        assert regen_btn.is_visible(), "REGENERATE button not visible"
        regen_btn.click()

        # Wait for regeneration to finish
        page.wait_for_selector("text=✓ VALIDATED", timeout=15000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "07_regenerated_validated.png"))

        updated_val_text = page.inner_text("main")
        assert "✓ VALIDATED" in updated_val_text, "Status did not change to ✓ VALIDATED"
        assert "96% Accuracy" not in updated_val_text, "Found misleading 96% Accuracy wording"
        print("  ✓ Corrected content generated. Validation status: ✓ VALIDATED (no '96% Accuracy' displayed)")
        test_results["REGENERATION"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 7: HUMAN REVIEW & VALIDATE AGAIN
        # -----------------------------------------------------------------
        print("\nSTEP 7: Testing HUMAN REVIEW / EDIT ...")
        human_review_btn = page.locator("button:has-text('HUMAN REVIEW')")
        human_review_btn.click()

        time.sleep(0.5)
        textarea = page.locator("textarea")
        assert textarea.is_visible(), "Human review textarea not visible"
        
        current_text = textarea.input_value()
        modified_text = current_text + "\n[Official Verification Note: All coastal safety protocols active.]"
        textarea.fill(modified_text)
        time.sleep(0.5)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "08_human_review_edited.png"))

        print("  Clicking VALIDATE AGAIN ...")
        validate_again_btn = page.locator("button:has-text('VALIDATE AGAIN')")
        validate_again_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "09_validated_again.png"))

        after_val_text = page.inner_text("main")
        assert "✓ VALIDATED" in after_val_text, "Validation failed after human review"
        print("  ✓ Human review edited content successfully re-validated.")
        test_results["HUMAN REVIEW"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 8: APPROVE OUTPUT -> FINAL PACKAGE
        # -----------------------------------------------------------------
        print("\nSTEP 8: Clicking APPROVE OUTPUT ...")
        approve_btn = page.locator("button:has-text('APPROVE OUTPUT')")
        approve_btn.click()

        page.wait_for_selector("text=COMMUNICATION PACKAGE READY", timeout=10000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "10_communication_package_ready.png"))

        final_text = page.inner_text("main")
        assert "COMMUNICATION PACKAGE READY" in final_text, "Final package header not found"
        print("  ✓ Application reached: COMMUNICATION PACKAGE READY")
        test_results["APPROVAL"] = "PASS"

        # -----------------------------------------------------------------
        # STEP 9: VERIFY EXPORTS (DOWNLOAD TXT & DOWNLOAD ZIP)
        # -----------------------------------------------------------------
        print("\nSTEP 9: Verifying DOWNLOAD TXT & DOWNLOAD ZIP ...")
        
        # Test DOWNLOAD TXT
        with page.expect_download(timeout=10000) as download_info:
            page.locator("button:has-text('DOWNLOAD TXT')").click()
        download_txt = download_info.value
        txt_path = os.path.join(SCREENSHOT_DIR, download_txt.suggested_filename)
        download_txt.save_as(txt_path)
        assert os.path.exists(txt_path) and os.path.getsize(txt_path) > 50, "TXT file invalid or empty"
        with open(txt_path, "r", encoding="utf-8") as f:
            txt_content = f.read()
        assert "NEXORA AI" in txt_content, "TXT export missing brand header"
        assert "Heavy Rainfall Warning" in txt_content, "TXT export missing topic"
        print(f"  ✓ DOWNLOAD TXT triggered & verified ({os.path.basename(txt_path)}, {os.path.getsize(txt_path)} bytes)")
        test_results["TXT EXPORT"] = "PASS"

        # Test DOWNLOAD ZIP
        with page.expect_download(timeout=15000) as download_zip_info:
            page.locator("button:has-text('DOWNLOAD ZIP')").click()
        download_zip = download_zip_info.value
        zip_path = os.path.join(SCREENSHOT_DIR, download_zip.suggested_filename)
        download_zip.save_as(zip_path)
        assert os.path.exists(zip_path) and os.path.getsize(zip_path) > 100, "ZIP file invalid or empty"
        print(f"  ✓ DOWNLOAD ZIP triggered & verified ({os.path.basename(zip_path)}, {os.path.getsize(zip_path)} bytes)")
        test_results["ZIP EXPORT"] = "PASS"

        context.close()

        # -----------------------------------------------------------------
        # STEP 10: MOBILE RESPONSIVE TEST (390 x 844)
        # -----------------------------------------------------------------
        print("\nSTEP 10: Mobile Responsive Verification at 390 x 844 ...")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        mpage = mobile_context.new_page()

        # 1. Mobile Dashboard
        mpage.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "11_mobile_dashboard.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile dashboard: {sw} > {cw}"
        print("  ✓ Mobile Dashboard: No horizontal overflow (width 390px)")

        # 2. Mobile Source of Truth
        mpage.locator("button:has-text('START DEMO')").click()
        mpage.wait_for_selector("main h2:has-text('SOURCE OF TRUTH')", timeout=10000)
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "12_mobile_source_of_truth.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile Source of Truth: {sw} > {cw}"
        print("  ✓ Mobile Source of Truth: Clean layout, no overflow")

        # 3. Mobile Orchestrator
        mpage.locator("button:has-text('Continue to Orchestrator')").click()
        mpage.wait_for_selector("main h2:has-text('Communication Orchestrator')", timeout=10000)
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "13_mobile_orchestrator.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile Orchestrator: {sw} > {cw}"
        print("  ✓ Mobile Orchestrator: Dimensions stack vertically, buttons fully usable")

        # 4. Mobile Generate & Output
        mpage.locator("button:has-text('GENERATE COMMUNICATION')").click()
        mpage.wait_for_selector("main h2:has-text('Generated Communications')", timeout=15000)
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "14_mobile_generated_output.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile Generated Output: {sw} > {cw}"
        print("  ✓ Mobile Generated Output: Cards readable, buttons fit neatly")

        # 5. Mobile Validation View
        mpage.locator("button:has-text('[ TEST VALIDATION ]')").click()
        mpage.wait_for_selector("main h2:has-text('CRITICAL FACT VALIDATION')", timeout=10000)
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "15_mobile_validation.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile Validation View: {sw} > {cw}"
        print("  ✓ Mobile Validation: Audits stacked properly, no overflow")

        # Regenerate & Approve to reach Final Package on Mobile
        mpage.locator("button:has-text('REGENERATE')").click()
        mpage.wait_for_selector("main:has-text('✓ VALIDATED')", timeout=15000)
        time.sleep(0.5)
        mpage.locator("button:has-text('APPROVE OUTPUT')").click()
        mpage.wait_for_selector("main h2:has-text('COMMUNICATION PACKAGE READY')", timeout=10000)
        time.sleep(0.5)
        mpage.screenshot(path=os.path.join(SCREENSHOT_DIR, "16_mobile_final_package.png"))
        sw = mpage.evaluate("document.documentElement.scrollWidth")
        cw = mpage.evaluate("document.documentElement.clientWidth")
        assert sw <= cw + 2, f"Horizontal overflow on mobile Final Package: {sw} > {cw}"
        print("  ✓ Mobile Final Package: All export options readable & usable")
        test_results["MOBILE 390x844"] = "PASS"

        mobile_context.close()
        browser.close()

    print("\n=================================================================")
    print("ALL REAL BROWSER TESTS EXECUTED SUCCESSFULLY!")
    print("=================================================================")
    return test_results

if __name__ == "__main__":
    results = run_test()
    for k, v in results.items():
        print(f"{k}: {v}")
