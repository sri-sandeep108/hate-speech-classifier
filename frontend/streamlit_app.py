import os
import pathlib
import time

import requests
import streamlit as st

API_URL = os.environ.get("API_URL", "http://localhost:8000")
PDF_PATH = pathlib.Path(__file__).parent / "Dissertation.pdf"

EXAMPLES = [
    "What a beautiful morning, I love hiking with my dog in the park.",
    "Immigrants like you don't belong here, go back to your country.",
    "I disagree with your policy proposal, but I respect your right to express it.",
    "People like you are subhuman filth and should be wiped out.",
    "This new community center has been such a wonderful addition to the neighborhood.",
]

st.set_page_config(
    page_title="Hate Speech Classifier | MLOps on AWS EKS",
    page_icon="🛡️",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------------------------------------------------------------------
# CATPPUCCIN MOCHA STYLES & RESPONSIVE DESIGN
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    code, pre {
        font-family: 'JetBrains Mono', monospace !important;
    }

    /* Hero Header */
    .hero-container {
        text-align: center;
        padding: 2.2rem 1rem 1.6rem 1rem;
    }
    
    .hero-title {
        font-size: 2.7rem;
        font-weight: 800;
        background: linear-gradient(135deg, #cba6f7 0%, #b4befe 50%, #89dceb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }
    
    .hero-subtitle {
        color: #a6adc8;
        font-size: 1.05rem;
        max-width: 650px;
        margin: 0 auto 1.2rem auto;
        line-height: 1.5;
    }
    
    /* Badges */
    .badge-wrap {
        display: flex;
        justify-content: center;
        gap: 0.45rem;
        flex-wrap: wrap;
        margin-top: 0.6rem;
    }
    
    .badge-tag {
        background: #181825;
        border: 1px solid #313244;
        color: #cdd6f4;
        padding: 0.28rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .badge-accent {
        background: rgba(203, 166, 247, 0.12);
        border: 1px solid rgba(203, 166, 247, 0.35);
        color: #cba6f7;
        padding: 0.28rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 600;
    }

    .badge-cloud {
        background: rgba(116, 199, 236, 0.12);
        border: 1px solid rgba(116, 199, 236, 0.35);
        color: #89dceb;
        padding: 0.28rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 600;
    }

    /* Result Banners */
    .result-box-hateful {
        background: rgba(243, 139, 168, 0.12);
        border: 1.5px solid rgba(243, 139, 168, 0.5);
        border-radius: 12px;
        padding: 1.1rem 1.3rem;
        color: #f38ba8;
        font-weight: 700;
        font-size: 1.15rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .result-box-safe {
        background: rgba(166, 227, 161, 0.12);
        border: 1.5px solid rgba(166, 227, 161, 0.5);
        border-radius: 12px;
        padding: 1.1rem 1.3rem;
        color: #a6e3a1;
        font-weight: 700;
        font-size: 1.15rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .latency-pill {
        font-size: 0.8rem;
        font-weight: 500;
        background: #181825;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        color: #bac2de;
        border: 1px solid #313244;
    }

    /* Metrics card */
    div[data-testid="stMetricValue"] {
        color: #cba6f7 !important;
        font-weight: 800 !important;
    }
    
    div[data-testid="stMetricLabel"] {
        color: #a6adc8 !important;
    }

    /* Clean Card Styling */
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background: #181825 !important;
        border: 1px solid #313244 !important;
        border-radius: 14px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        margin-bottom: 1.2rem !important;
    }

    /* Footer */
    footer, #MainMenu { visibility: hidden; }
    
    .footer-text {
        text-align: center;
        color: #6c7086;
        font-size: 0.82rem;
        margin-top: 2.5rem;
        padding-top: 1rem;
        border-top: 1px solid #313244;
    }

    /* Mobile / Responsive adjustments */
    @media (max-width: 768px) {
        .hero-title { font-size: 2rem !important; }
        .hero-subtitle { font-size: 0.95rem !important; }
        .result-box-hateful, .result-box-safe {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
        }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------------------------------------------------
# HERO SECTION
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <div class="hero-container">
        <div class="hero-title">🛡️ Hate Speech Classifier</div>
        <p class="hero-subtitle">
            Fine-tuned DistilBERT transformer operationalized into a production-grade, 
            observable MLOps system on Amazon EKS.
        </p>
        <div class="badge-wrap">
            <span class="badge-accent">DistilBERT</span>
            <span class="badge-accent">FastAPI</span>
            <span class="badge-accent">spaCy</span>
            <span class="badge-cloud">AWS EKS</span>
            <span class="badge-cloud">Terraform</span>
            <span class="badge-cloud">GitHub Actions</span>
            <span class="badge-tag">Prometheus</span>
            <span class="badge-tag">Grafana</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(ttl=300)
def fetch_info():
    response = requests.get(f"{API_URL}/info", timeout=8)
    response.raise_for_status()
    return response.json()


# ---------------------------------------------------------------------------------------------------------------------
# NAVIGATION TABS
# ---------------------------------------------------------------------------------------------------------------------

tab_live, tab_research, tab_architecture = st.tabs(
    ["🚀 Live Inference Sandbox", "📄 Dissertation & Benchmarks", "☁️ Cloud & MLOps Architecture"]
)

# ---------------------------------------------------------------------------------------------------------------------
# TAB 1: LIVE INFERENCE
# ---------------------------------------------------------------------------------------------------------------------

with tab_live:
    container_live = st.container(border=True)
    with container_live:
        st.markdown("#### 💬 Text Classification")
        st.caption("Select a sample sentence or type your own text to evaluate for hate speech.")

        if "text_input" not in st.session_state:
            st.session_state.text_input = ""

        def _set_example(example_text):
            st.session_state.text_input = example_text

        # Example buttons
        st.markdown("**Sample Inputs:**")
        cols = st.columns(len(EXAMPLES))
        for col, example in zip(cols, EXAMPLES):
            short_lbl = (example[:18] + "…") if len(example) > 18 else example
            col.button(
                short_lbl,
                key=f"btn_{example[:12]}",
                on_click=_set_example,
                args=(example,),
                use_container_width=True,
            )

        text = st.text_area(
            "Enter text to evaluate",
            height=110,
            placeholder="Type a sentence to classify (e.g. 'I love hiking with my dog')...",
            key="text_input",
            label_visibility="collapsed",
        )

        char_count = len(text)
        col_meta, col_btn_clear, col_btn_run = st.columns([3, 1, 2])
        col_meta.caption(f"Length: `{char_count}` / 2000 characters")

        clear_clicked = col_btn_clear.button("Clear", use_container_width=True)
        classify_clicked = col_btn_run.button(
            "Classify Text ⚡",
            type="primary",
            disabled=not text.strip(),
            use_container_width=True,
        )

        if clear_clicked:
            st.session_state.text_input = ""
            st.rerun()

        if classify_clicked:
            with st.spinner("Classifying via DistilBERT transformer..."):
                t_start = time.perf_counter()
                try:
                    res = requests.post(f"{API_URL}/predict", json={"text": text}, timeout=30)
                    res.raise_for_status()
                    latency_ms = (time.perf_counter() - t_start) * 1000
                except requests.RequestException as err:
                    st.error(f"Inference request failed: {err}")
                else:
                    data = res.json()
                    label = data["label"]
                    hateful_score = data["hateful_score"]
                    safe_score = data["not_hateful_score"]

                    if label == "Hateful":
                        st.markdown(
                            f'<div class="result-box-hateful">'
                            f'<span>⚠️ Classification: <strong>Hateful Content</strong></span>'
                            f'<span class="latency-pill">Latency: {latency_ms:.1f}ms</span>'
                            f'</div>',
                            unsafe_allow_html=True,
                        )
                    else:
                        st.markdown(
                            f'<div class="result-box-safe">'
                            f'<span>✅ Classification: <strong>Not-Hateful (Safe)</strong></span>'
                            f'<span class="latency-pill">Latency: {latency_ms:.1f}ms</span>'
                            f'</div>',
                            unsafe_allow_html=True,
                        )

                    st.write("")
                    col_p1, col_p2 = st.columns(2)
                    with col_p1:
                        st.caption(f"🔴 Hateful Confidence: **{hateful_score:.1%}**")
                        st.progress(hateful_score)
                    with col_p2:
                        st.caption(f"🟢 Not-Hateful Confidence: **{safe_score:.1%}**")
                        st.progress(safe_score)

# ---------------------------------------------------------------------------------------------------------------------
# TAB 2: DISSERTATION & BENCHMARKS
# ---------------------------------------------------------------------------------------------------------------------

with tab_research:
    container_dissertation = st.container(border=True)
    with container_dissertation:
        st.markdown("#### 📄 Research Dissertation")
        st.write(
            "This project operationalizes text-classification research comparing five model architectures "
            "(Static GloVe embeddings, BERT, DistilBERT, RoBERTa, and ELECTRA) on hate speech detection. "
            "The fine-tuned **DistilBERT** pipeline achieves state-of-the-art accuracy while maintaining a lightweight footprint (~265MB)."
        )

        if PDF_PATH.exists():
            with open(PDF_PATH, "rb") as f:
                pdf_bytes = f.read()
            st.download_button(
                label="📥 Download Full Dissertation (PDF - 4.1MB)",
                data=pdf_bytes,
                file_name="Hate_Speech_Classification_Dissertation.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True,
            )
        else:
            st.info("Dissertation PDF is accessible in the project repository.")

    container_benchmarks = st.container(border=True)
    with container_benchmarks:
        st.markdown("#### 📊 Model Benchmark Accuracy")
        st.caption("Measured on held-out test split via `spacy benchmark accuracy`.")

        try:
            info = fetch_info()
            b = info["benchmark"]
            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Macro F1", f"{b['macro_f1']:.2%}")
            m2.metric("Macro AUC", f"{b['macro_auc']:.2%}")
            m3.metric("Hateful F1", f"{b['hateful_f1']:.2%}")
            m4.metric("Not-Hateful F1", f"{b['not_hateful_f1']:.2%}")
        except requests.RequestException:
            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Macro F1", "81.09%")
            m2.metric("Macro AUC", "92.77%")
            m3.metric("Hateful F1", "69.18%")
            m4.metric("Not-Hateful F1", "93.01%")

        st.markdown("---")
        st.markdown(
            """
            | Model Architecture | Base Weights | Params | Macro F1 | Deployment Selection |
            | :--- | :--- | :--- | :--- | :--- |
            | **DistilBERT (Selected)** | `distilbert-base-uncased` | ~66M | **0.811** | **Production Target** |
            | RoBERTa | `roberta-base` | ~125M | 0.814 | Heavy footprint |
            | BERT | `bert-base-uncased` | ~110M | 0.803 | Baseline Transformer |
            | ELECTRA | `google/electra-base-discriminator`| ~110M | 0.798 | Discriminator |
            | GloVe Vectors | Static GloVe 300d | ~2.2M | 0.712 | Baseline Bag-of-Words |
            """
        )

# ---------------------------------------------------------------------------------------------------------------------
# TAB 3: CLOUD & MLOPS ARCHITECTURE
# ---------------------------------------------------------------------------------------------------------------------

with tab_architecture:
    container_arch = st.container(border=True)
    with container_arch:
        st.markdown("#### ☁️ Production Architecture Stack")
        st.markdown(
            """
            - **Backend Service**: FastAPI microservice serving spaCy DistilBERT with custom Prometheus metric hooks (`predict_classifications_total`, `predict_inference_seconds`).
            - **Model Distribution**: Model weights (~265MB) fetched dynamically from [Hugging Face Hub (`thenewguyhere/hate-speech-distilbert`)](https://huggingface.co/thenewguyhere/hate-speech-distilbert) at container startup.
            - **Cloud Infrastructure**: Fully provisioned via **Terraform** on AWS:
              - Custom VPC with public subnets (NAT/Internet Gateway) & private subnets.
              - **AWS EKS** (Kubernetes v1.31) with Managed Node Groups (`t3.large`).
              - **Amazon ECR** with automated vulnerability scans and image lifecycle retention rules.
            - **Observability**: **Prometheus Operator + Grafana** automatically scraping custom FastAPI & PyTorch latency histograms.
            - **CI/CD Pipeline**: **GitHub Actions** with automated Ruff linting, Pytest test runner, Docker Buildx multi-platform builds, Amazon ECR push, and zero-downtime rolling updates to EKS.
            """
        )

    with st.expander("🛠️ Live Backend Health Check"):
        try:
            health = requests.get(f"{API_URL}/health", timeout=5).json()
            st.json(health)
        except requests.RequestException as exc:
            st.warning(f"Could not reach backend at {API_URL}: {exc}")

# ---------------------------------------------------------------------------------------------------------------------
# FOOTER
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    '<div class="footer-text">'
    "Portfolio MLOps Project &bull; DistilBERT Text Classification &bull; "
    "FastAPI &bull; Streamlit &bull; AWS EKS &bull; Terraform &bull; GitHub Actions &bull; Prometheus &amp; Grafana"
    "</div>",
    unsafe_allow_html=True,
)
