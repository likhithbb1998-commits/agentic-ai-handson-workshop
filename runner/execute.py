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

DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"


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
        "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY", ""),
        "MODEL_NAME": os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL),
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
    model = os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL)
    if api_key:
        try:
            req_data = json.dumps({
                "model": model,
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
    try:
        limit_resources()
    except Exception:
        pass

    raw_input = sys.stdin.read()
    if not raw_input:
        sys.exit(0)

    try:
        data = json.loads(raw_input)
        user_code = data.get("code", "")
    except Exception:
        user_code = raw_input

    exec_globals = {
        "__builtins__": {
            "abs": abs, "all": all, "any": any, "bin": bin, "bool": bool,
            "bytes": bytes, "callable": callable, "chr": chr, "dict": dict,
            "dir": dir, "divmod": divmod, "enumerate": enumerate, "filter": filter,
            "float": float, "format": format, "frozenset": frozenset, "getattr": getattr,
            "hasattr": hasattr, "hash": hash, "hex": hex, "id": id, "int": int,
            "isinstance": isinstance, "issubclass": issubclass, "iter": iter, "len": len,
            "list": list, "map": map, "max": max, "min": min, "next": next,
            "object": object, "oct": oct, "ord": ord, "pow": pow, "print": print,
            "range": range, "repr": repr, "reversed": reversed, "round": round,
            "set": set, "slice": slice, "sorted": sorted, "str": str, "sum": sum,
            "tuple": tuple, "type": type, "zip": zip, "__import__": safe_import,
        },
        "ask_ai": real_ask_ai,
    }

    try:
        exec(user_code, exec_globals)
    except Exception as exc:
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
