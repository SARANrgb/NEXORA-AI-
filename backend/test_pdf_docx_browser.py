import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def test_pdf_and_docx_browser():
    sample_dir = os.path.abspath(r"d:\New Folder(1)\ss\communi-ai\test_samples")
    pdf_path = os.path.join(sample_dir, "blood_donation.pdf")
    docx_path = os.path.join(sample_dir, "blood_donation.docx")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        
        # Test 1: PDF Upload
        page = browser.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        
        print("Uploading PDF in browser...")
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(pdf_path)
        time.sleep(2)
        
        pdf_text = page.locator('textarea').input_value()
        print("PDF extracted text length:", len(pdf_text))
        assert "Blood Donation" in pdf_text or "blood donation" in pdf_text.lower()
        print("  ✓ PDF upload in browser extracted cleanly!")
        
        # Test 2: DOCX Upload
        page.reload(wait_until="networkidle")
        time.sleep(1)
        print("Uploading DOCX in browser...")
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(docx_path)
        time.sleep(2)
        
        docx_text = page.locator('textarea').input_value()
        print("DOCX extracted text length:", len(docx_text))
        assert "Blood Donation" in docx_text or "blood donation" in docx_text.lower()
        print("  ✓ DOCX upload in browser extracted cleanly!")
        
        browser.close()
    print("ALL BINARY DOCUMENT UPLOADS VERIFIED IN REAL BROWSER!")

if __name__ == "__main__":
    test_pdf_and_docx_browser()
