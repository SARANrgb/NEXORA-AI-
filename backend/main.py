import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import ProcessDocumentRequest, CommunicationRequest, SourceOfTruth, GeneratedContent, ValidationResult
from llm_provider import LLMProvider
from gemini_provider import GeminiProvider
from mock_provider import MockProvider

load_dotenv()

app = FastAPI(title="COMMUNI-AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
provider: LLMProvider = GeminiProvider(api_key) if api_key else MockProvider()

@app.post("/api/extract", response_model=SourceOfTruth)
def extract_source_of_truth(req: ProcessDocumentRequest):
    try:
        return provider.extract_source_of_truth(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate", response_model=list[GeneratedContent])
def generate_packages(req: CommunicationRequest):
    results = []
    try:
        for role in req.roles:
            for fmt in req.formats:
                for lang in req.languages:
                    for channel in req.channels:
                        content = provider.generate_communication(
                            req.source_of_truth, role, fmt, lang, channel
                        )
                        results.append(GeneratedContent(
                            id=str(uuid.uuid4()),
                            role=role,
                            format=fmt,
                            language=lang,
                            channel=channel,
                            content=content
                        ))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class ValidateRequest(BaseModel):
    source_of_truth: SourceOfTruth
    generated_content: str

@app.post("/api/validate", response_model=ValidationResult)
def validate_content(req: ValidateRequest):
    try:
        return provider.validate_content(req.source_of_truth, req.generated_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
