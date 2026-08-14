import os

import requests
import streamlit as st

API_URL = os.environ.get("API_URL", "http://localhost:8000")

EXAMPLES = [
    "What a beautiful morning, I love hiking with my dog.",
    "Immigrants like you don't belong here, go back to your country.",
    "I disagree with your policy proposal but respect your right to make it.",
    "People like you are subhuman and should be erased.",
]

st.set_page_config(
    page_title="Hate Speech Classifier",
    page_icon="🛡️",
    layout="centered",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    html, body, [class*="css"]  { font-family: 'Inter', sans-serif; }

    .hero {
        text-align: center;
        padding: 2.2rem 1rem 1.6rem 1rem;
    }
    .hero h1 {
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(90deg, #A78BFA 0%, #7C5CFC 50%, #5B8DEF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.3rem;
    }
    .hero p {
        color: #A0A0AC;
        font-size: 1.05rem;
        max-width: 620px;
        margin: 0 auto;
    }
    .badge-row {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }
    .badge {
        background: #1A1D29;
        border: 1px solid #2E3142;
        color: #C9C9D6;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
    }
    div[data-testid="stVerticalBlockBorderWrapper"] {
        border-radius: 14px !important;
        margin-bottom: 1.2rem;
    }
    .result-hateful {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        color: #FCA5A5;
        font-weight: 700;
        font-size: 1.1rem;
    }
    .result-not-hateful {
        background: rgba(52, 211, 153, 0.12);
        border: 1px solid rgba(52, 211, 153, 0.4);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        color: #6EE7B7;
        font-weight: 700;
        font-size: 1.1rem;
    }
    footer, #MainMenu { visibility: hidden; }
    .footnote {
        text-align: center;
        color: #6B6B78;
        font-size: 0.8rem;
        margin-top: 2rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <h1>🛡️ Hate Speech Classifier</h1>
        <p>A DistilBERT-based text classifier that flags hateful content in real time,
        served through a FastAPI backend.</p>
        <div class="badge-row">
            <span class="badge">Python</span>
            <span class="badge">FastAPI</span>
            <span class="badge">spaCy</span>
            <span class="badge">DistilBERT</span>
            <span class="badge">Streamlit</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(ttl=300)
def fetch_info():
    response = requests.get(f"{API_URL}/info", timeout=10)
    response.raise_for_status()
    return response.json()


with st.container(border=True):
    st.markdown("### About this project")
    try:
        info = fetch_info()
        st.write(info["description"])
        st.markdown(
            f"**Architecture:** {info['architecture']}  \n"
            f"**Base model:** `{info['base_model']}`  \n"
            f"**Labels:** {', '.join(info['labels'])}"
        )
    except requests.RequestException:
        info = None
        st.write(
            "One of five text-classification architectures (static GloVe vectors, BERT, "
            "DistilBERT, RoBERTa, ELECTRA) trained and benchmarked as part of a dissertation "
            "comparing them on a hate speech dataset. This app serves the DistilBERT model."
        )
        st.warning(f"Backend unreachable at {API_URL} — showing static project info only.")

if info:
    with st.container(border=True):
        st.markdown("### Model performance")
        st.caption("Measured on a held-out test split via `spacy benchmark accuracy`.")
        b = info["benchmark"]
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Macro F1", f"{b['macro_f1']:.2f}")
        c2.metric("Macro AUC", f"{b['macro_auc']:.2f}")
        c3.metric("Hateful F1", f"{b['hateful_f1']:.2f}")
        c4.metric("Not-Hateful F1", f"{b['not_hateful_f1']:.2f}")

try_it = st.container(border=True)
try_it.markdown("### Try it")

if "text_input" not in st.session_state:
    st.session_state.text_input = ""


def _set_example(example):
    st.session_state.text_input = example


with try_it:
    st.caption("Or try an example:")
    cols = st.columns(len(EXAMPLES))
    for col, example in zip(cols, EXAMPLES):
        short_label = (example[:22] + "…") if len(example) > 22 else example
        col.button(short_label, key=f"ex_{example}", on_click=_set_example, args=(example,), use_container_width=True)

    text = st.text_area(
        "Enter text to classify",
        height=120,
        placeholder="Type something...",
        key="text_input",
        label_visibility="collapsed",
    )

    classify_clicked = st.button("Classify", type="primary", disabled=not text.strip(), use_container_width=True)

    if classify_clicked:
        with st.spinner("Calling API..."):
            try:
                response = requests.post(f"{API_URL}/predict", json={"text": text}, timeout=30)
                response.raise_for_status()
            except requests.RequestException as exc:
                st.error(f"Request to backend failed: {exc}")
            else:
                result = response.json()
                label = result["label"]
                css_class = "result-hateful" if label == "Hateful" else "result-not-hateful"
                icon = "⚠️" if label == "Hateful" else "✅"
                st.markdown(
                    f'<div class="{css_class}">{icon} Prediction: {label}</div>',
                    unsafe_allow_html=True,
                )
                st.write("")
                st.caption(f"Hateful score: {result['hateful_score']:.3f}")
                st.progress(result["hateful_score"])
                st.caption(f"Not-Hateful score: {result['not_hateful_score']:.3f}")
                st.progress(result["not_hateful_score"])

with st.expander("Backend status"):
    try:
        health = requests.get(f"{API_URL}/health", timeout=5).json()
        st.json(health)
    except requests.RequestException as exc:
        st.warning(f"Could not reach backend at {API_URL}: {exc}")

st.markdown(
    '<p class="footnote">Part of a larger DevOps portfolio project — '
    "containerized, deployed to Kubernetes via Terraform, CI/CD with GitHub Actions, "
    "monitored with Prometheus &amp; Grafana.</p>",
    unsafe_allow_html=True,
)
