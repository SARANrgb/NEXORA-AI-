from llm_provider import LLMProvider
from models import SourceOfTruth, ValidationResult

class MockProvider(LLMProvider):
    def extract_source_of_truth(self, text: str) -> SourceOfTruth:
        return SourceOfTruth(
            topic="Heavy Rainfall Warning",
            key_facts=["Heavy rainfall expected"],
            dates=["August 23–25"],
            numbers=[],
            locations=["District A", "District B", "District C"],
            entities=["Fishermen", "Emergency response teams"],
            instructions=["Emergency response teams should remain active."],
            warnings=["Fishermen should not venture into the sea."],
            context="Routine weather update"
        )

    def generate_communication(self, sot: SourceOfTruth, role: str, format: str, language: str, channel: str) -> str:
        # Mocking the demo failure explicitly
        if role == "Field Officer" and format == "Action Checklist":
             return "Heavy rainfall is expected in District A and District B until August 24. Ensure basic provisions."
             
        return f"""Dear {role},
This is a {format} regarding {sot.topic}.
Please note the heavy rainfall in {', '.join(sot.locations)} from {', '.join(sot.dates)}.
Warning: {', '.join(sot.warnings)}
Action required: {', '.join(sot.instructions)}
Stay safe.
Sent via {channel} in {language}."""

    def validate_content(self, sot: SourceOfTruth, generated_content: str) -> ValidationResult:
        if "District C" not in generated_content and "August 24" in generated_content:
            return ValidationResult(
                status="REVIEW",
                score=40,
                preserved_facts=["District A", "District B"],
                missing_facts=["District C", "August 25", "Fishermen warning", "Emergency instruction"],
                altered_facts=["Dates altered to August 24"]
            )
            
        return ValidationResult(
            status="PASS",
            score=96,
            preserved_facts=["August 23–25", "District A", "District B", "District C", "Fishermen warning", "Emergency instruction"],
            missing_facts=[],
            altered_facts=[]
        )
