MODEL_INFO = {
    "name": "DistilBERT Hate Speech Classifier",
    "architecture": "spaCy TextCatEnsemble.v2 (DistilBERT transformer + BOW linear model)",
    "base_model": "distilbert-base-uncased",
    "labels": ["Hateful", "Not-Hateful"],
    "description": (
        "One of five text-classification architectures (static GloVe vectors, BERT, "
        "DistilBERT, RoBERTa, ELECTRA) trained and benchmarked in a dissertation comparing "
        "them on a hate speech dataset. This app serves the DistilBERT model."
    ),
    # From spacy benchmark accuracy against the held-out test split.
    "benchmark": {
        "macro_f1": 0.8109244471,
        "macro_auc": 0.9276663319,
        "hateful_f1": 0.6917621386,
        "not_hateful_f1": 0.9300867557,
    },
}
