"""One-off script: push the trained spaCy DistilBERT pipeline to the Hugging Face Hub.

Run this once (and again whenever the model is retrained). Requires you to be
logged in first: `huggingface-cli login` (or set the HF_TOKEN env var).

Usage:
    python scripts/upload_model_to_hf.py <hf-username>/<repo-name> [path-to-model-best]
"""

import sys
from pathlib import Path

from huggingface_hub import HfApi

DEFAULT_MODEL_DIR = Path.home() / "code" / "Dissertation" / "output" / "distilbert" / "model-best"


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    repo_id = sys.argv[1]
    model_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_MODEL_DIR

    if not model_dir.is_dir():
        raise SystemExit(f"Model directory not found: {model_dir}")

    api = HfApi()
    api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True)
    api.upload_folder(repo_id=repo_id, repo_type="model", folder_path=str(model_dir))
    print(f"Uploaded {model_dir} to https://huggingface.co/{repo_id}")


if __name__ == "__main__":
    main()
