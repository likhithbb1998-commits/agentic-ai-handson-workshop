import json
import resource
import sys
import os
import math
import re
import random
import time
import types
import urllib.request


def limit_resources():
    def lower_soft_limit(kind, desired):
        try:
            _soft, hard = resource.getrlimit(kind)
            allowed = desired if hard == resource.RLIM_INFINITY else min(desired, hard)
            resource.setrlimit(kind, (allowed, hard))
        except (ValueError, OSError):
            pass

    lower_soft_limit(resource.RLIMIT_CPU, 3)
    lower_soft_limit(resource.RLIMIT_AS, 128 * 1024 * 1024)
    if hasattr(resource, "RLIMIT_DATA"):
        lower_soft_limit(resource.RLIMIT_DATA, 128 * 1024 * 1024)
    lower_soft_limit(resource.RLIMIT_FSIZE, 1024 * 1024)
    lower_soft_limit(resource.RLIMIT_NOFILE, 32)


class SafeOS:
    environ = {
        "OPENAI_API_KEY": os.environ.get("OPENROUTER_API_KEY", "sk-proj-workshop-demo-key-87420"),
        "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY", ""),
        "MODEL_NAME": os.environ.get("OPENROUTER_MODEL", "google/gemini-2.5-flash"),
        "API_BASE": "https://openrouter.ai/api/v1"
    }

    @staticmethod
    def getenv(key, default=None):
        return SafeOS.environ.get(key, default)


def safe_import(name, *args, **kwargs):
    allowed = {
        "json": json,
        "math": math,
        "re": re,
        "random": random,
        "time": time,
        "os": SafeOS,
    }
    if name in allowed:
        return allowed[name]
    mock = types.ModuleType(name)
    return mock


def real_ask_ai(prompt):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if api_key:
        try:
            req_data = json.dumps({
                "model": os.environ.get("OPENROUTER_MODEL", "google/gemini-2.5-flash"),
                "messages": [
                    {"role": "system", "content": "You are a concise AI specialist agent in a live workshop. Provide a direct, focused response without markdown formatting."},
                    {"role": "user", "content": str(prompt)}
                ],
                "max_tokens": 200,
                "temperature": 0.3
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://openrouter.ai/api/v1/chat/completions",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-OpenRouter-Title": "LiuantX Live Workshop"
                }
            )
            with urllib.request.urlopen(req, timeout=6) as resp:
                res_body = json.loads(resp.read().decode("utf-8"))
                text = res_body["choices"][0]["message"]["content"].strip()
                return f"[AI Model Response]: {text}"
        except Exception:
            pass

    p = str(prompt).lower()
    if "research" in p:
        return "[AI Researcher]: Multi-Agent architectures split complex tasks into specialized roles (Researcher, Writer, Reviewer), improving accuracy by 40% and preventing context window overload."
    elif "write" in p or "draft" in p:
        return "[AI Writer]: Executive Draft: Multi-Agent AI systems organize autonomous LLM agents with clear instructions and shared state to solve end-to-end enterprise workflows."
    elif "review" in p:
        return "[AI Reviewer]: Quality Evaluation: Draft approved. Structure, technical clarity, and agent handoffs meet workshop standards."
    else:
        return f"[AI Model Response]: Formulated response for '{prompt}' using role instructions."


def main():
    limit_resources()
    payload = json.loads(sys.stdin.read())
    code = payload.get("code", "")
    safe_builtins = {
        "print": print, "len": len, "range": range, "str": str, "int": int,
        "float": float, "bool": bool, "list": list, "dict": dict, "set": set,
        "tuple": tuple, "enumerate": enumerate, "zip": zip, "min": min,
        "max": max, "sum": sum, "sorted": sorted, "abs": abs,
        "AssertionError": AssertionError, "__import__": safe_import,
        "ask_ai": real_ask_ai,
    }
    namespace = {"__builtins__": safe_builtins, "ask_ai": real_ask_ai}
    exec(compile(code, "<workshop>", "exec"), namespace, namespace)


if __name__ == "__main__":
    main()
