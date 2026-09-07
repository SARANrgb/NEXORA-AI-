import io
import pypdf
import docx

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from TXT, PDF, and DOCX files.
    Preserves Unicode for all regional and international languages.
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext == 'txt':
        try:
            return file_bytes.decode('utf-8').strip()
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1', errors='replace').strip()
            
    elif ext == 'pdf':
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_parts.append(page_text.strip())
            extracted = "\n\n".join(text_parts).strip()
            if not extracted:
                raise ValueError("PDF contains no readable text layers.")
            return extracted
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
            
    elif ext in ['docx', 'doc']:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            parts = []
            for p in doc.paragraphs:
                if p.text.strip():
                    parts.append(p.text.strip())
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        parts.append(row_text)
            extracted = "\n\n".join(parts).strip()
            if not extracted:
                raise ValueError("DOCX document contains no text.")
            return extracted
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
            
    else:
        raise ValueError(f"Unsupported file extension .{ext}. Please upload a TXT, PDF, or DOCX document.")
