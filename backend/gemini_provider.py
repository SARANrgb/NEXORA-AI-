import os
import json
from llm_provider import LLMProvider
from models import SourceOfTruth, ValidationResult
import google.generativeai as genai

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        prompt = f"""Extract the following information from the text and return as a JSON object.
Text: "{text}"

JSON schema required:
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
Return ONLY valid JSON.
"""
        response = self.model.generate_content(prompt)
        content = response.text
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        data = json.loads(content.strip())
        return SourceOfTruth(**data)

    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        prompt = f"""Generate a communication package based on the following Source of Truth.
        
Topic: {sot.topic}
Key Facts: {', '.join(sot.key_facts)}
Dates: {', '.join(sot.dates)}
Numbers: {', '.join(sot.numbers)}
Locations: {', '.join(sot.locations)}
Entities: {', '.join(sot.entities)}
Instructions: {', '.join(sot.instructions)}
Warnings: {', '.join(sot.warnings)}
Context: {sot.context}

Target Audience/Role: {role}
Format: {format}
Language: {language}
Channel: {channel}

Write the content in the target language. Do not output anything other than the requested content.
"""
        response = self.model.generate_content(prompt)
        return response.text.strip()

    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        prompt = f"""Validate if the generated content preserves the critical facts from the Source of Truth.

Source of Truth:
Dates: {', '.join(sot.dates)}
Numbers: {', '.join(sot.numbers)}
Locations: {', '.join(sot.locations)}
Entities: {', '.join(sot.entities)}
Warnings: {', '.join(sot.warnings)}
Instructions: {', '.join(sot.instructions)}

Generated Content:
"{generated_content}"

Check if all the source of truth details are preserved in the generated content (translating meaning if in another language).
Return a JSON object with this exact structure:
{{
  "status": "PASS" or "REVIEW",
  "score": integer (0 to 100),
  "preserved_facts": ["fact1", "fact2"],
  "missing_facts": ["fact1"],
  "altered_facts": ["fact1"]
}}
Return ONLY valid JSON.
"""
        response = self.model.generate_content(prompt)
        content = response.text
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        data = json.loads(content.strip())
        return ValidationResult(**data)
