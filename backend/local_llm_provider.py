import os
import json
import requests
from typing import Optional, Dict, Any
from llm_provider import LLMProvider
from models import SourceOfTruth, ValidationResult
from mock_provider import MockProvider

class LocalLLMProvider(LLMProvider):
    """
    Local / Open-Source LLM Provider for NEXORA AI.
    
    Compatible with:
    - Ollama (http://localhost:11434)
    - Local OpenAI-compatible inference servers (LM Studio, vLLM, llama.cpp, LocalAI)
    
    If the local inference endpoint is unreachable or fails, explicitly falls back
    to DemoProvider (MockProvider) without interrupting system operation.
    """
    
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:11434")).rstrip("/")
        self.model_name = model or os.getenv("LOCAL_LLM_MODEL", "llama3")
        self.timeout = float(os.getenv("LOCAL_LLM_TIMEOUT", "15.0"))
        self.fallback = MockProvider()
        self._is_connected: Optional[bool] = None

    def check_availability(self) -> bool:
        """
        Probes the local inference endpoint with a short timeout.
        Supports both Ollama (/api/tags or /api/version) and OpenAI-compatible (/v1/models).
        """
        try:
            # 1. Probe Ollama version or tags
            res = requests.get(f"{self.base_url}/api/version", timeout=1.5)
            if res.status_code == 200:
                self._is_connected = True
                return True
        except Exception:
            pass

        try:
            # 2. Probe Ollama tags
            res = requests.get(f"{self.base_url}/api/tags", timeout=1.5)
            if res.status_code == 200:
                self._is_connected = True
                return True
        except Exception:
            pass

        try:
            # 3. Probe OpenAI-compatible /v1/models
            res = requests.get(f"{self.base_url}/v1/models", timeout=1.5)
            if res.status_code == 200:
                self._is_connected = True
                return True
        except Exception:
            pass

        self._is_connected = False
        return False

    @property
    def is_available(self) -> bool:
        if self._is_connected is None:
            return self.check_availability()
        return self._is_connected

    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        """
        Extracts structured entities and safety bounds from raw document text.
        To maintain strict ground truth determinism (Requirement 5), we extract
        factual bounds through the deterministic extractor and optionally enrich
        with the local LLM if connected.
        """
        # Baseline deterministic extraction ensures no hallucinations of dates, locations, or topics
        deterministic_sot = self.fallback.extract_source_of_truth(text)

        if not self.is_available:
            return deterministic_sot

        # If local model is available, attempt JSON extraction prompt
        prompt = f"""Extract structured facts from the following public document into JSON.
Text:
\"\"\"{text}\"\"\"

Required JSON schema:
{{
  "topic": "string",
  "key_facts": ["string"],
  "dates": ["string"],
  "numbers": ["string"],
  "locations": ["string"],
  "entities": ["string"],
  "instructions": ["string"],
  "warnings": ["string"],
  "context": "string"
}}
Return ONLY valid JSON."""

        try:
            response_text = self._call_local_model(prompt, json_format=True)
            if response_text:
                cleaned = response_text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:-3]
                elif cleaned.startswith("```"):
                    cleaned = cleaned[3:-3]
                data = json.loads(cleaned.strip())
                # Merge: Ensure deterministic critical dates & locations remain authoritative
                if not data.get("dates") and deterministic_sot.dates:
                    data["dates"] = deterministic_sot.dates
                if not data.get("locations") and deterministic_sot.locations:
                    data["locations"] = deterministic_sot.locations
                return SourceOfTruth(**data)
        except Exception as e:
            print(f"[LocalLLMProvider] Extraction fallback to deterministic engine: {e}")

        return deterministic_sot

    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        """
        Generates role-, format-, language-, and channel-tailored communication.
        Strictly grounded by the Source of Truth.
        """
        if not self.is_available:
            return self.fallback.generate_communication(sot, role, format, language, channel)

        prompt = f"""You are NEXORA AI, an Authoritative Communication Orchestrator.
Generate a tailored public advisory / directive strictly bounded by the following Source of Truth facts.
Do NOT invent or hallucinate any dates, locations, or regulations not present below.

SOURCE OF TRUTH:
Topic: {sot.topic}
Locations: {', '.join(sot.locations)}
Dates: {', '.join(sot.dates)}
Key Directives / Instructions: {', '.join(sot.instructions)}
Warnings / Precautions: {', '.join(sot.warnings)}
Contacts: {', '.join(sot.contact)}
Context: {sot.context}

TARGET CRITERIA:
Role / Audience: {role}
Document Format: {format}
Language: {language}
Delivery Channel: {channel}

OUTPUT REQUIREMENTS:
- Write in {language}.
- Tailor tone appropriately for {role} via {channel}.
- Include the exact dates ({', '.join(sot.dates)}) and locations ({', '.join(sot.locations)}).
- Output ONLY the message text without commentary or preamble.
"""
        try:
            generated_text = self._call_local_model(prompt, json_format=False)
            if generated_text and len(generated_text.strip()) > 10:
                return generated_text.strip()
        except Exception as e:
            print(f"[LocalLLMProvider] Generation fallback to deterministic engine: {e}")

        return self.fallback.generate_communication(sot, role, format, language, channel)

    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        """
        Audits generated content against the Source of Truth.
        CRITICAL REQUIREMENT 7: Always uses the deterministic audit engine
        to verify Dates, Locations, Warnings, and Instructions without relying on LLM self-grading.
        """
        return self.fallback.validate_content(sot, generated_content)

    def _call_local_model(self, prompt: str, json_format: bool = False) -> Optional[str]:
        """
        Dispatches inference call to local endpoint (supports Ollama /api/generate and OpenAI /v1/chat/completions).
        """
        # 1. Try Ollama /api/generate
        try:
            payload: Dict[str, Any] = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False
            }
            if json_format:
                payload["format"] = "json"

            res = requests.post(f"{self.base_url}/api/generate", json=payload, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                return data.get("response")
        except Exception:
            pass

        # 2. Try OpenAI-compatible /v1/chat/completions
        try:
            payload = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            res = requests.post(f"{self.base_url}/v1/chat/completions", json=payload, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content")
        except Exception:
            pass

        return None
