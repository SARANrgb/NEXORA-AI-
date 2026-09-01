from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SourceOfTruth(BaseModel):
    topic: str
    key_facts: List[str]
    dates: List[str]
    numbers: List[str]
    locations: List[str]
    entities: List[str]
    instructions: List[str]
    warnings: List[str]
    context: str

class CommunicationRequest(BaseModel):
    roles: List[str]
    formats: List[str]
    languages: List[str]
    channels: List[str]
    source_of_truth: SourceOfTruth

class GeneratedContent(BaseModel):
    role: str
    format: str
    language: str
    channel: str
    content: str
    id: str

class ValidationResult(BaseModel):
    status: str # "PASS" or "REVIEW"
    score: int
    preserved_facts: List[str]
    missing_facts: List[str]
    altered_facts: List[str]

class FinalPackage(BaseModel):
    items: List[GeneratedContent]

class ProcessDocumentRequest(BaseModel):
    text: str
