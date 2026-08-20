from pathlib import Path

# Resolve path to system_prompt.md in the prompt directory
PROMPT_DIR = Path(__file__).parent
SYSTEM_PROMPT_FILE = PROMPT_DIR / "system_prompt.md"


def load_system_prompt() -> str:
    """Read system prompt from system_prompt.md file."""
    if not SYSTEM_PROMPT_FILE.exists():
        raise FileNotFoundError(f"System prompt file missing: {SYSTEM_PROMPT_FILE}")
    return SYSTEM_PROMPT_FILE.read_text(encoding="utf-8").strip()


SYSTEM_PROMPT = load_system_prompt()
