from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models import SourceOfTruth, GeneratedContent, ValidationResult

class LLMProvider(ABC):
    """
    Core LLM / Inference Engine Interface for Nexora AI.
    
    Modular architecture:
    - DemoProvider: Built-in deterministic ground-truth engine (MockProvider)
    - LocalLLMProvider: Open-source local inference (Ollama / OpenAI-compatible)
    - LocalNPUProvider: Architecture for on-device Snapdragon / edge NPU integration
    - GeminiProvider: (Optional / Deprecated legacy provider)
    """
    
    @abstractmethod
    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        """Extracts structured entities and safety bounds from raw document text."""
        pass

    @abstractmethod
    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        """Synthesizes role, format, and channel-tailored communication strictly bounded by Source of Truth."""
        pass
    
    @abstractmethod
    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        """Audits generated content against Source of Truth for critical fact retention."""
        pass

class LocalNPUProvider(LLMProvider):
    """
    Placeholder abstraction for future on-device NPU integration (Snapdragon / Local LLM).
    Ready for edge deployment without altering Nexora AI core services.
    """
    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        raise NotImplementedError("On-device NPU pipeline initialization pending hardware runtime binding.")

    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        raise NotImplementedError("On-device NPU pipeline initialization pending hardware runtime binding.")

    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        raise NotImplementedError("On-device NPU pipeline initialization pending hardware runtime binding.")
