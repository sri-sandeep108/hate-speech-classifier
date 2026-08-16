import os
import time
from functools import lru_cache

import spacy
from prometheus_client import Counter, Histogram

PREDICT_CLASSIFICATIONS = Counter(
    "predict_classifications_total",
    "Predictions by classified label",
    ["label"],
)
PREDICT_HATEFUL_SCORE = Histogram(
    "predict_hateful_score",
    "Distribution of the hateful_score across predictions",
    buckets=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
)
PREDICT_INFERENCE_SECONDS = Histogram(
    "predict_inference_seconds",
    "Time spent in the spaCy nlp() call, excluding HTTP/serialization overhead",
)
PREDICT_INPUT_TEXT_LENGTH = Histogram(
    "predict_input_text_length_chars",
    "Distribution of input text length (characters) on /predict requests",
    buckets=[10, 25, 50, 100, 250, 500, 1000, 2000],
)


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

    PREDICT_INPUT_TEXT_LENGTH.observe(len(text))
    start = time.perf_counter()
    doc = nlp(text)
    PREDICT_INFERENCE_SECONDS.observe(time.perf_counter() - start)

    label = "Hateful" if doc.cats["Hateful"] > doc.cats["Not-Hateful"] else "Not-Hateful"
    PREDICT_CLASSIFICATIONS.labels(label=label).inc()
    PREDICT_HATEFUL_SCORE.observe(doc.cats["Hateful"])

    return {
        "label": label,
        "hateful_score": doc.cats["Hateful"],
        "not_hateful_score": doc.cats["Not-Hateful"],
    }
