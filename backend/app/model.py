import os
from functools import lru_cache

import spacy


def _resolve_model_path() -> str:
    """Find the spaCy pipeline directory to load.

    MODEL_PATH (a local directory) wins if set — used for local dev, pointing
    straight at an already-trained pipeline on disk. Otherwise fall back to
    downloading a snapshot from the Hugging Face Hub repo in HF_MODEL_REPO,
    which is what the container image uses.
    """
    local_path = os.environ.get("MODEL_PATH")
    if local_path:
        if not os.path.isdir(local_path):
            raise RuntimeError(f"MODEL_PATH={local_path!r} does not exist")
        return local_path

    repo_id = os.environ.get("HF_MODEL_REPO")
    if repo_id:
        from huggingface_hub import snapshot_download

        return snapshot_download(repo_id=repo_id)

    raise RuntimeError(
        "Set MODEL_PATH to a local spaCy pipeline directory, or HF_MODEL_REPO "
        "to a Hugging Face Hub repo id to download one."
    )


@lru_cache(maxsize=1)
def get_nlp():
    return spacy.load(_resolve_model_path())


def predict(text: str) -> dict:
    nlp = get_nlp()
    doc = nlp(text)
    return {
        "label": "Hateful" if doc.cats["Hateful"] > doc.cats["Not-Hateful"] else "Not-Hateful",
        "hateful_score": doc.cats["Hateful"],
        "not_hateful_score": doc.cats["Not-Hateful"],
    }
