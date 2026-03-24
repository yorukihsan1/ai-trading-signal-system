import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
from src.detection.fake_detector import detect_pattern
from src.signal.signal_engine import generate_signal

st.title("📊 AI Trading Signal System")

if st.button("Analiz Et"):
    pattern = detect_pattern()
    result = generate_signal(pattern)

    st.write(f"### Pattern: {pattern}")
    st.write(f"### Signal: {result['signal']}")
    st.write(f"### Confidence: {result['confidence']}")