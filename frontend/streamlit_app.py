import os
import pathlib
import time

import requests
import streamlit as st

# Determine API URL: Use environment variable, fallback to localhost:8000 or live AWS EKS
DEFAULT_API = os.environ.get(
    "API_URL",
    "http://localhost:8000",
)
PDF_PATH = pathlib.Path(__file__).parent / "Dissertation.pdf"

# Curated example test cases (clean neutral Catppuccin styling)
PRESET_EXAMPLES_ROW1 = [
    {
        "label": "Friendly Message",
        "text": "What a beautiful morning! I love spending time with friends and family in the park.",
    },
    {
        "label": "Policy Debate",
        "text": "I disagree with the recent economic policy changes, but I respect the committee's decision.",
    },
    {
        "label": "Community Notice",
        "text": "The new community workshop was incredibly informative and helpful for everyone.",
    },
]

PRESET_EXAMPLES_ROW2 = [
    {
        "label": "Hostile Speech",
        "text": "Get out of our country, people like you ruin everything and don't belong here.",
    },
    {
        "label": "Severe Violation",
        "text": "You are subhuman filth and your entire group should be eradicated.",
    },
]

st.set_page_config(
    page_title="Hate Speech Detection & MLOps Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------------------------------------------------------------------
# CATPPUCCIN MOCHA PRODUCTION STYLES & OVERFLOW-PROOF RESPONSIVE LAYOUT
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    
    *, *::before, *::after {
        box-sizing: border-box !important;
    }
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    code, pre {
        font-family: 'JetBrains Mono', monospace !important;
    }

    /* Hide Streamlit Header, Toolbar, Deploy Button & Top Artifacts */
    header[data-testid="stHeader"] {
        display: none !important;
        height: 0px !important;
        visibility: hidden !important;
    }
    [data-testid="stToolbar"] {
        display: none !important;
        visibility: hidden !important;
    }
    [data-testid="stDecoration"] {
        display: none !important;
        visibility: hidden !important;
    }
    [data-testid="stStatusWidget"] {
        display: none !important;
        visibility: hidden !important;
    }
    .stAppDeployButton {
        display: none !important;
        visibility: hidden !important;
    }
    #MainMenu {
        visibility: hidden !important;
    }
    footer {
        visibility: hidden !important;
    }

    /* Full-Width Fluid Container across All Displays */
    .block-container {
        width: 100% !important;
        max-width: 95vw !important;
        padding-top: 1.8rem !important;
        padding-bottom: 3.5rem !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
    }

    /* 4K and Ultra-Wide displays (1800px+) */
    @media (min-width: 1800px) {
        .block-container {
            max-width: 1850px !important;
            padding-left: 3.5rem !important;
            padding-right: 3.5rem !important;
        }
        .hero-title {
            font-size: 2.6rem !important;
        }
        .hero-lead {
            font-size: 1.12rem !important;
            max-width: 1050px !important;
        }
        .section-title {
            font-size: 1.25rem !important;
        }
        div[data-testid="stMetricValue"] {
            font-size: 1.8rem !important;
        }
    }

    /* Top Navigation Bar */
    .app-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 1.4rem;
        background: #181825;
        border: 1px solid #313244;
        border-radius: 12px;
        margin-bottom: 1.6rem;
    }
    
    .nav-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #cdd6f4;
    }
    
    .nav-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: #a6e3a1;
        background: rgba(166, 227, 161, 0.08);
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        border: 1px solid rgba(166, 227, 161, 0.2);
    }
    
    .status-dot {
        width: 7.5px;
        height: 7.5px;
        background-color: #a6e3a1;
        border-radius: 50%;
        box-shadow: 0 0 8px #a6e3a1;
        animation: pulse-dot 2s infinite ease-in-out;
    }
    
    @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* Hero Section */
    .hero-box {
        background: linear-gradient(180deg, rgba(203, 166, 247, 0.06) 0%, rgba(24, 24, 37, 0.4) 100%);
        border: 1px solid #313244;
        border-radius: 14px;
        padding: 2rem 2.2rem 1.6rem 2.2rem;
        margin-bottom: 1.8rem;
        text-align: left;
    }
    
    .hero-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #cba6f7 0%, #b4befe 50%, #89dceb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.025em;
        line-height: 1.2;
        margin-bottom: 0.5rem;
    }
    
    .hero-lead {
        color: #a6adc8;
        font-size: 1.05rem;
        max-width: 900px;
        line-height: 1.55;
        margin-bottom: 1rem;
    }
    
    /* Technology Badge Strip */
    .tech-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
    }
    
    .tech-badge {
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.3rem 0.7rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }
    
    .badge-mauve {
        background: rgba(203, 166, 247, 0.1);
        color: #cba6f7;
        border: 1px solid rgba(203, 166, 247, 0.25);
    }
    
    .badge-sky {
        background: rgba(137, 220, 235, 0.1);
        color: #89dceb;
        border: 1px solid rgba(137, 220, 235, 0.25);
    }
    
    .badge-lavender {
        background: rgba(180, 190, 254, 0.1);
        color: #b4befe;
        border: 1px solid rgba(180, 190, 254, 0.25);
    }
    
    .badge-teal {
        background: rgba(148, 226, 213, 0.1);
        color: #94e2d5;
        border: 1px solid rgba(148, 226, 213, 0.25);
    }

    /* Container Cards - Single Uniform Border with Zero Overflow */
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background: #181825 !important;
        border: 1px solid #313244 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18) !important;
        padding: 1.2rem 1.4rem !important;
        margin-bottom: 1.4rem !important;
    }

    div[data-testid="stVerticalBlockBorderWrapper"] > div {
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Columns & Horizontal Layout */
    div[data-testid="column"], div[data-testid="stHorizontalBlock"] {
        min-width: 0 !important;
    }

    /* Streamlit Buttons - Catppuccin Mocha Palette */
    div.stButton > button {
        background: #1e1e2e !important;
        color: #cdd6f4 !important;
        border: 1px solid #313244 !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        padding: 0.45rem 0.8rem !important;
        transition: all 0.18s ease-in-out !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }
    
    div.stButton > button:hover {
        background: #313244 !important;
        border-color: #585b70 !important;
        color: #cba6f7 !important;
    }
    
    /* Primary Action Button (Analyze Text) */
    div.stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #cba6f7 0%, #b4befe 100%) !important;
        color: #11111b !important;
        border: none !important;
        font-weight: 700 !important;
        font-size: 0.92rem !important;
        box-shadow: 0 2px 10px rgba(203, 166, 247, 0.25) !important;
    }
    
    div.stButton > button[kind="primary"]:hover {
        background: linear-gradient(135deg, #d5bbf9 0%, #c4cdfe 100%) !important;
        color: #11111b !important;
        box-shadow: 0 4px 14px rgba(203, 166, 247, 0.35) !important;
    }

    /* Download Button */
    div.stDownloadButton > button {
        background: rgba(180, 190, 254, 0.1) !important;
        color: #b4befe !important;
        border: 1px solid rgba(180, 190, 254, 0.3) !important;
        border-radius: 8px !important;
        font-weight: 700 !important;
        font-size: 0.9rem !important;
        transition: all 0.18s ease-in-out !important;
    }
    
    div.stDownloadButton > button:hover {
        background: rgba(180, 190, 254, 0.18) !important;
        border-color: #b4befe !important;
        color: #cdd6f4 !important;
    }

    /* Text Area */
    div[data-baseweb="textarea"] {
        background: #11111b !important;
        border: 1px solid #313244 !important;
        border-radius: 8px !important;
    }
    
    div[data-baseweb="textarea"]:focus-within {
        border-color: #cba6f7 !important;
        box-shadow: 0 0 0 1px #cba6f7 !important;
    }
    
    textarea {
        color: #cdd6f4 !important;
        font-size: 0.92rem !important;
    }

    /* Section Titles */
    .section-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #cdd6f4;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
    }
    
    .section-subtitle {
        color: #a6adc8;
        font-size: 0.88rem;
        margin-bottom: 0.9rem;
    }

    /* Result Cards (Soft Muted Catppuccin Accents) */
    .result-card-hateful {
        background: rgba(235, 160, 172, 0.08);
        border: 1px solid rgba(235, 160, 172, 0.4);
        border-radius: 10px;
        padding: 1.1rem 1.3rem;
        margin-top: 0.8rem;
    }
    
    .result-card-safe {
        background: rgba(166, 227, 161, 0.08);
        border: 1px solid rgba(166, 227, 161, 0.4);
        border-radius: 10px;
        padding: 1.1rem 1.3rem;
        margin-top: 0.8rem;
    }
    
    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;
    }
    
    .result-label-hateful {
        color: #eba0ac;
        font-size: 1.15rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.45rem;
    }
    
    .result-label-safe {
        color: #a6e3a1;
        font-size: 1.15rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.45rem;
    }

    .meta-chip {
        font-size: 0.75rem;
        font-weight: 600;
        background: #11111b;
        color: #bac2de;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        border: 1px solid #313244;
        font-family: 'JetBrains Mono', monospace;
    }

    /* Metric Tiles */
    div[data-testid="stMetricValue"] {
        color: #cba6f7 !important;
        font-weight: 800 !important;
        font-size: 1.55rem !important;
    }
    
    div[data-testid="stMetricLabel"] {
        color: #a6adc8 !important;
        font-size: 0.82rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    /* Tabs Styling */
    button[data-baseweb="tab"] {
        font-weight: 700 !important;
        font-size: 0.94rem !important;
        padding: 0.6rem 1.2rem !important;
    }

    /* Footer */
    .app-footer {
        text-align: center;
        color: #6c7086;
        font-size: 0.84rem;
        margin-top: 3.5rem;
        padding: 1.4rem;
        border-top: 1px solid #313244;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    /* Responsive Queries */
    @media (max-width: 900px) {
        .block-container { padding-left: 1rem !important; padding-right: 1rem !important; }
        .hero-title { font-size: 1.75rem !important; }
        .hero-lead { font-size: 0.95rem !important; }
        .app-footer { justify-content: center; text-align: center; }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------------------------------------------------
# TOP NAVIGATION BAR
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <div class="app-nav">
        <div class="nav-brand">
            <span>🛡️</span>
            <span>HateSpeech.AI <span style="color: #cba6f7; font-weight: 400; font-size: 0.85rem;">| MLOps Platform</span></span>
        </div>
        <div class="nav-status">
            <div class="status-dot"></div>
            <span>System Operational</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------------------------------------------------
# HERO BANNER
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <div class="hero-box">
        <div class="hero-title">DistilBERT Hate Speech Classifier</div>
        <div class="hero-lead">
            An end-to-end cloud-native MLOps architecture operationalizing fine-tuned transformer research 
            into a high-throughput, observable classification system running on Amazon Elastic Kubernetes Service.
        </div>
        <div class="tech-strip">
            <span class="tech-badge badge-mauve">⚡ DistilBERT Transformer</span>
            <span class="tech-badge badge-lavender">🐍 FastAPI Microservice</span>
            <span class="tech-badge badge-sky">☁️ AWS EKS v1.31</span>
            <span class="tech-badge badge-sky">🏗️ Terraform VPC &amp; IAM</span>
            <span class="tech-badge badge-lavender">🚀 GitHub Actions CI/CD</span>
            <span class="tech-badge badge-teal">📊 Prometheus &amp; Grafana</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(ttl=300)
def fetch_info(api_endpoint: str):
    try:
        res = requests.get(f"{api_endpoint}/info", timeout=5)
        res.raise_for_status()
        return res.json()
    except requests.RequestException:
        return {
            "name": "DistilBERT Hate Speech Classifier",
            "architecture": "spaCy TextCatEnsemble.v2 (DistilBERT transformer + BOW linear model)",
            "base_model": "distilbert-base-uncased",
            "labels": ["Hateful", "Not-Hateful"],
            "benchmark": {
                "macro_f1": 0.8109,
                "macro_auc": 0.9277,
                "hateful_f1": 0.6918,
                "not_hateful_f1": 0.9301,
            },
        }


# ---------------------------------------------------------------------------------------------------------------------
# MAIN ASYMMETRIC DASHBOARD GRID (7 : 5 RATIO)
# ---------------------------------------------------------------------------------------------------------------------

col_left, col_right = st.columns([7, 5], gap="large")

# ---------------------------------------------------------------------------------------------------------------------
# LEFT COLUMN: LIVE INFERENCE WORKSPACE
# ---------------------------------------------------------------------------------------------------------------------

with col_left:
    container_input = st.container(border=True)
    with container_input:
        st.markdown('<div class="section-title">💬 Live Inference Studio</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="section-subtitle">Input any text or select a preset below to evaluate hate speech probability.</div>',
            unsafe_allow_html=True,
        )

        if "user_text" not in st.session_state:
            st.session_state.user_text = ""

        def _apply_sample(txt):
            st.session_state.user_text = txt

        # Interactive preset buttons in clean multi-column rows
        st.markdown("**Sample Test Inputs:**")
        r1_c1, r1_c2, r1_c3 = st.columns(3)
        r1_c1.button(
            PRESET_EXAMPLES_ROW1[0]["label"],
            key="p_btn_0",
            on_click=_apply_sample,
            args=(PRESET_EXAMPLES_ROW1[0]["text"],),
            use_container_width=True,
        )
        r1_c2.button(
            PRESET_EXAMPLES_ROW1[1]["label"],
            key="p_btn_1",
            on_click=_apply_sample,
            args=(PRESET_EXAMPLES_ROW1[1]["text"],),
            use_container_width=True,
        )
        r1_c3.button(
            PRESET_EXAMPLES_ROW1[2]["label"],
            key="p_btn_2",
            on_click=_apply_sample,
            args=(PRESET_EXAMPLES_ROW1[2]["text"],),
            use_container_width=True,
        )

        r2_c1, r2_c2 = st.columns(2)
        r2_c1.button(
            PRESET_EXAMPLES_ROW2[0]["label"],
            key="p_btn_3",
            on_click=_apply_sample,
            args=(PRESET_EXAMPLES_ROW2[0]["text"],),
            use_container_width=True,
        )
        r2_c2.button(
            PRESET_EXAMPLES_ROW2[1]["label"],
            key="p_btn_4",
            on_click=_apply_sample,
            args=(PRESET_EXAMPLES_ROW2[1]["text"],),
            use_container_width=True,
        )

        st.write("")

        # Text input area
        input_text = st.text_area(
            "Text Input",
            placeholder="Type or paste text here (e.g. 'What a wonderful day to collaborate on open source!')...",
            height=130,
            key="user_text",
            label_visibility="collapsed",
        )

        char_len = len(input_text)
        meta_col, clear_col, action_col = st.columns([5, 2, 3])
        meta_col.caption(f"Length: `{char_len}` / 2000 characters")

        if clear_col.button("Clear", use_container_width=True):
            st.session_state.user_text = ""
            st.rerun()

        run_inference = action_col.button(
            "Classify Text ⚡",
            type="primary",
            disabled=not input_text.strip(),
            use_container_width=True,
        )

        # Inference Processing
        if run_inference:
            with st.spinner("Classifying via DistilBERT transformer..."):
                start_clock = time.perf_counter()
                try:
                    resp = requests.post(f"{DEFAULT_API}/predict", json={"text": input_text}, timeout=15)
                    resp.raise_for_status()
                    duration_ms = (time.perf_counter() - start_clock) * 1000
                    payload = resp.json()
                except requests.RequestException as ex:
                    st.error(f"Inference Connection Error: {ex}")
                else:
                    pred_label = payload.get("label", "Not-Hateful")
                    hateful_val = payload.get("hateful_score", 0.0)
                    safe_val = payload.get("not_hateful_score", 1.0)

                    # Dynamic Result Presentation (Soft Catppuccin Accents)
                    if pred_label == "Hateful":
                        st.markdown(
                            f"""
                            <div class="result-card-hateful">
                                <div class="result-header">
                                    <div class="result-label-hateful">
                                        <span>⚠️</span>
                                        <span>HATE SPEECH DETECTED</span>
                                    </div>
                                    <span class="meta-chip">Latency: {duration_ms:.1f}ms</span>
                                </div>
                                <div style="color: #cdd6f4; font-size: 0.92rem; margin-top: 0.35rem;">
                                    This text contains language flagged as toxic or violating community safety guidelines.
                                </div>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )
                    else:
                        st.markdown(
                            f"""
                            <div class="result-card-safe">
                                <div class="result-header">
                                    <div class="result-label-safe">
                                        <span>🛡️</span>
                                        <span>SAFE &bull; NOT HATEFUL</span>
                                    </div>
                                    <span class="meta-chip">Latency: {duration_ms:.1f}ms</span>
                                </div>
                                <div style="color: #cdd6f4; font-size: 0.92rem; margin-top: 0.35rem;">
                                    This text was classified as standard civil discourse or benign content.
                                </div>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

                    st.write("")
                    p_col1, p_col2 = st.columns(2)
                    with p_col1:
                        st.markdown(f"**🔴 Hate Speech Score:** `{hateful_val:.2%}`")
                        st.progress(hateful_val)
                    with p_col2:
                        st.markdown(f"**🟢 Safe Score:** `{safe_val:.2%}`")
                        st.progress(safe_val)

# ---------------------------------------------------------------------------------------------------------------------
# RIGHT COLUMN: MODEL SPECS, RESEARCH PAPER & BENCHMARKS
# ---------------------------------------------------------------------------------------------------------------------

with col_right:
    # 1. Model Specs Card
    container_specs = st.container(border=True)
    with container_specs:
        st.markdown('<div class="section-title">🤖 Model Architecture</div>', unsafe_allow_html=True)
        st.markdown(
            """
            - **Base Architecture**: `distilbert-base-uncased` (spaCy `TextCatEnsemble.v2`)
            - **Parameter Count**: **66.3 Million** parameters (~40% smaller than BERT-Base)
            - **Model Size**: **~265 MB** weights loaded dynamically from Hugging Face
            - **Runtime Engine**: PyTorch + FastAPI with Uvicorn async workers
            """
        )
        st.link_button(
            "🤗 Hugging Face Hub: `thenewguyhere/hate-speech-distilbert`",
            "https://huggingface.co/thenewguyhere/hate-speech-distilbert",
            use_container_width=True,
        )

    # 2. Benchmark Tile Grid
    container_metrics = st.container(border=True)
    with container_metrics:
        st.markdown('<div class="section-title">📊 Benchmark Metrics</div>', unsafe_allow_html=True)
        st.caption("Evaluated on held-out test split using standardized NLP benchmark metrics.")

        b_data = fetch_info(DEFAULT_API)["benchmark"]
        m_row1_col1, m_row1_col2 = st.columns(2)
        m_row1_col1.metric("Macro AUC", f"{b_data['macro_auc']:.1%}", help="Area under ROC curve")
        m_row1_col2.metric("Macro F1", f"{b_data['macro_f1']:.1%}", help="Harmonic mean of precision and recall")

        m_row2_col1, m_row2_col2 = st.columns(2)
        m_row2_col1.metric("Safe F1", f"{b_data['not_hateful_f1']:.1%}", help="F1 on benign / neutral class")
        m_row2_col2.metric("Hateful F1", f"{b_data['hateful_f1']:.1%}", help="F1 on positive hate-speech class")

    # 3. Dissertation PDF Download
    container_paper = st.container(border=True)
    with container_paper:
        st.markdown('<div class="section-title">📄 Research Dissertation</div>', unsafe_allow_html=True)
        st.write(
            "Original research comparing 5 NLP architectures (Static GloVe, BERT, DistilBERT, RoBERTa, ELECTRA) "
            "for automated hate speech classification."
        )

        if PDF_PATH.exists():
            with open(PDF_PATH, "rb") as pdf_file:
                pdf_data = pdf_file.read()
            st.download_button(
                label="📥 Download Research Paper (PDF • 4.1MB)",
                data=pdf_data,
                file_name="Hate_Speech_Classification_Dissertation.pdf",
                mime="application/pdf",
                use_container_width=True,
            )
        else:
            st.info("Dissertation PDF artifact is bundled with the repository.")

# ---------------------------------------------------------------------------------------------------------------------
# SECONDARY FULL-WIDTH SECTION: COMPARISONS, MLOPS ARCHITECTURE & LIVE TELEMETRY
# ---------------------------------------------------------------------------------------------------------------------

st.markdown("---")

tab_comp, tab_devops, tab_telemetry = st.tabs(
    ["🏆 Multi-Model Architecture Comparison", "🏗️ 6-Layer Cloud & MLOps Architecture", "📈 Live Health & Observability"]
)

# Tab 1: Architecture Comparison
with tab_comp:
    container_tab1 = st.container(border=True)
    with container_tab1:
        st.markdown("### 🏆 Architecture Comparison Matrix")
        st.markdown(
            "The dissertation benchmarked 5 distinct architectures under identical train/test splits. "
            "**DistilBERT** was selected for production operationalization because it preserves **99.6% of RoBERTa's performance** while cutting parameter footprint in half and minimizing inference latency."
        )
        st.markdown(
            """
            | Architecture | Base Weights | Params | Footprint | Macro F1 | Macro AUC | Cloud Deployment Decision |
            | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
            | **DistilBERT (Selected)** | `distilbert-base-uncased` | **~66M** | **~265 MB** | **0.811** | **0.928** | 🚀 **Production Target (Fast & Efficient)** |
            | **RoBERTa** | `roberta-base` | ~125M | ~500 MB | 0.814 | 0.932 | High RAM requirement / Slower latency |
            | **BERT** | `bert-base-uncased` | ~110M | ~440 MB | 0.803 | 0.919 | Standard Baseline Transformer |
            | **ELECTRA** | `google/electra-base` | ~110M | ~440 MB | 0.798 | 0.915 | Replaced token detection discriminator |
            | **GloVe 300d** | Static GloVe Embeddings | ~2.2M | ~12 MB | 0.712 | 0.841 | Fast baseline bag-of-words model |
            """
        )

# Tab 2: 6-Layer DevOps Architecture
with tab_devops:
    container_tab2 = st.container(border=True)
    with container_tab2:
        st.markdown("### 🏗️ 6-Layer Production MLOps Roadmap")
        d_col1, d_col2 = st.columns(2, gap="medium")
        with d_col1:
            st.markdown(
                """
                **1. App Microservices (FastAPI + Streamlit)**
                - Modular Python services communicating over HTTP.
                - Custom Prometheus instrumentation on PyTorch inference duration.
                
                **2. Containerization (Docker)**
                - Multi-stage Docker builds with user isolation (`uid: 1000`).
                - Automated dynamic weights download from Hugging Face Hub.
                
                **3. Kubernetes Orchestration (`kind` & AWS EKS)**
                - Declarative Deployments, ClusterIP & LoadBalancer Services.
                - Calibrated Startup, Liveness, and Readiness probes.
                """
            )
        with d_col2:
            st.markdown(
                """
                **4. Cloud Observability (Prometheus + Grafana)**
                - Custom histograms for inference latency and confidence distribution.
                - Pre-provisioned Grafana dashboard auto-imported via ConfigMap.
                
                **5. Infrastructure as Code (Terraform on AWS)**
                - Complete AWS VPC, 2x Public + 2x Private Subnets, NAT GW, Internet GW.
                - EKS v1.31 Control Plane, Managed Node Groups (`t3.large`), IAM + OIDC.
                
                **6. CI/CD Automation (GitHub Actions)**
                - Automated Ruff linting, Pytest test runner, Docker Buildx multi-platform build, ECR push, and zero-downtime rolling updates.
                """
            )

# Tab 3: Observability & Health
with tab_telemetry:
    container_tab3 = st.container(border=True)
    with container_tab3:
        st.markdown("### 📈 Live Health & Telemetry Probes")
        h_col1, h_col2 = st.columns(2)
        with h_col1:
            st.markdown("**Backend Health Endpoint (`GET /health`):**")
            try:
                h_res = requests.get(f"{DEFAULT_API}/health", timeout=5).json()
                st.json(h_res)
            except requests.RequestException as e:
                st.warning(f"Could not reach backend health probe: {e}")

        with h_col2:
            st.markdown("**Prometheus Custom Metrics (`GET /metrics`):**")
            st.markdown(
                """
                - `predict_inference_seconds_bucket`: Pure PyTorch model inference latency histogram
                - `predict_classifications_total{label}`: Count of Hateful vs. Safe classifications
                - `predict_hateful_score_bucket`: Distribution of confidence probabilities
                - `predict_input_text_length_chars_bucket`: Character length distribution
                """
            )

# ---------------------------------------------------------------------------------------------------------------------
# FOOTER
# ---------------------------------------------------------------------------------------------------------------------

st.markdown(
    """
    <div class="app-footer">
        <div>
            <strong>Hate Speech Detection &amp; MLOps Platform</strong> &bull; DistilBERT Text Classification
        </div>
        <div>
            FastAPI &bull; Streamlit &bull; AWS EKS &bull; Terraform &bull; Prometheus &bull; Grafana &bull; GitHub Actions
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)
