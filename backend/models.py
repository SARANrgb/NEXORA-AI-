from pydantic import BaseModel, Field
from typing import List, Optional

class SourceOfTruth(BaseModel):
    topic: str
    key_facts: Optional[List[str]] = Field(default_factory=list)
    dates: List[str] = Field(default_factory=list)
    numbers: Optional[List[str]] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)
    entities: Optional[List[str]] = Field(default_factory=list)
    instructions: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    context: str = ""
    contact: Optional[List[str]] = Field(default_factory=list)
    constraints: Optional[List[str]] = Field(default_factory=list)

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

class UploadResponse(BaseModel):
    filename: str
    file_type: str
    extracted_text: str
    source_of_truth: SourceOfTruth
