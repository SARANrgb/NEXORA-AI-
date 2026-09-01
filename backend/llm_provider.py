from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models import SourceOfTruth, GeneratedContent, ValidationResult

class LLMProvider(ABC):
    @abstractmethod
    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        pass

    @abstractmethod
    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        pass
    
    @abstractmethod
    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        pass
