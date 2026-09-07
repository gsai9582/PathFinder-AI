from app.core.config import settings
from app.ai.base import AIProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.mock_provider import MockAIProvider

def get_ai_provider() -> AIProvider:
    """Returns configured AIProvider: GeminiProvider if key present and not disabled, otherwise MockAIProvider."""
    if settings.USE_MOCK_AI or not settings.GEMINI_API_KEY:
        return MockAIProvider()
    return GeminiProvider(api_key=settings.GEMINI_API_KEY)
