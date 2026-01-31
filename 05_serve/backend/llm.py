"""LLM provider abstraction for MLFL."""
from langchain_community.llms import Ollama
from langchain_anthropic import ChatAnthropic

from config import config


def get_llm():
    """Initialize the LLM based on configured provider."""
    if config.llm_provider == "claude":
        return ChatAnthropic(
            model=config.claude_model,
            api_key=config.anthropic_api_key,
        )
    else:
        return Ollama(
            model=config.ollama_model,
            base_url=config.ollama_url,
        )


def invoke_llm(llm, prompt: str) -> str:
    """Invoke LLM and return response as string."""
    response = llm.invoke(prompt)
    # Handle both Ollama (str) and ChatAnthropic (AIMessage) responses
    if hasattr(response, "content"):
        return response.content
    return str(response)
