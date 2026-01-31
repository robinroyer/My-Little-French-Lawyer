"""RAG (Retrieval Augmented Generation) logic for MLFL."""
from dataclasses import dataclass
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse

from config import config


@dataclass
class Source:
    """A source document retrieved from the vector store."""

    content: str
    metadata: dict


def get_vector_store() -> QdrantVectorStore | None:
    """Initialize the vector store for RAG."""
    try:
        embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        return QdrantVectorStore(
            client=QdrantClient(url=config.qdrant_url),
            collection_name=config.qdrant_collection,
            embedding=embeddings,
        )
    except Exception:
        return None


def check_qdrant_health() -> bool:
    """Check if Qdrant is accessible."""
    try:
        client = QdrantClient(url=config.qdrant_url)
        client.get_collections()
        return True
    except (UnexpectedResponse, Exception):
        return False


def retrieve_context(vector_store: QdrantVectorStore, query: str, k: int = 3) -> tuple[str, list[Source]]:
    """Retrieve relevant documents and return context string with sources."""
    docs = vector_store.similarity_search(query, k=k)

    sources = [
        Source(
            content=doc.page_content[:500],  # Truncate for display
            metadata=doc.metadata or {},
        )
        for doc in docs
    ]

    context = "\n\n---\n\n".join([doc.page_content for doc in docs])
    return context, sources


def build_prompt(query: str, context: str | None = None, history: list[dict] | None = None) -> str:
    """Build the prompt for the LLM."""
    system_prompt = """You are a helpful French legal assistant. You help users understand French law.
Answer questions clearly and accurately. If you cite specific articles or laws, be precise.
Always respond in the same language as the user's question."""

    if context:
        system_prompt += f"""

Use the following legal document excerpts to inform your answer.
If the answer isn't clearly supported by the provided context, acknowledge this limitation.

Context:
{context}"""

    # Build conversation history
    messages = [system_prompt]

    if history:
        for msg in history[-6:]:  # Keep last 6 messages for context
            role = "User" if msg["role"] == "user" else "Assistant"
            messages.append(f"{role}: {msg['content']}")

    messages.append(f"User: {query}")
    messages.append("Assistant:")

    return "\n\n".join(messages)
