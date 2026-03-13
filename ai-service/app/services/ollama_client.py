import httpx
from fastapi import HTTPException

from app.config import settings


class OllamaClient:
    async def generate(self, model: str, prompt: str, *, max_tokens: int | None = None) -> str:
        options = {
            "temperature": 0.2,
            "top_p": 0.9,
            "num_ctx": settings.ollama_num_ctx,
        }

        if max_tokens is not None:
            options["num_predict"] = max_tokens

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "keep_alive": settings.ollama_keep_alive,
            "options": options,
        }

        try:
            timeout = httpx.Timeout(settings.ollama_timeout_seconds, connect=5.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(f"{settings.ollama_base_url}/api/generate", json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "").strip()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Failed to communicate with Ollama: {exc}") from exc
