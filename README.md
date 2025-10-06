

# 🌌 **ExoQuest Platform**

### *AI-powered Exoplanet Detection and Research Platform for NASA Space Apps Challenge 2025*

<div align="center">

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue?style=for-the-badge\&logo=nasa)](https://www.spaceappschallenge.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge\&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-19+-blue?style=for-the-badge\&logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=for-the-badge\&logo=fastapi)](https://fastapi.tiangolo.com)

</div>

---

## 🪐 Overview

> **From Light Curves to New Worlds — ExoQuest turns raw starlight into planetary discovery.**

**ExoQuest Platform** is an end-to-end AI system for **exoplanet detection and research**, developed for **NASA Space Apps Challenge 2025**.
It combines **machine learning**, **interactive visualization**, and **research-ready tools** — making exoplanet discovery more **accessible, interpretable, and inspiring** for both researchers and students.

✨ *Built with FastAPI + React + Catboost, powered by data from NASA’s Kepler and TESS missions.*

---

## 🚀 Core Features

| Mode                   | Description                                                                          | Highlight                                  |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| 🔭 **Explore Mode**    | Step-by-step workflow for exoplanet detection — perfect for education & outreach.    | Upload → Visualize → Detect → Interpret    |
| 🧠 **Research Mode**   | Professional tools for large-scale analysis, threshold tuning, and model retraining. | Batch processing, CSV/PDF export           |
| 📊 **Explainability**  | Real-time **SHAP** interpretation of model predictions.                              | Confidence, calibration, feature impact    |
| 🛰️ **AI Integration** | Ensemble of Catboost and CatBoost models for robust prediction.                      | Supports both tabular and light curve data |
| ⚙️ **Infrastructure**  | Fully Dockerized — one-click deploy with integrated FastAPI + Redis + MinIO.         | Production-ready architecture              |

---

## 🌌 Interface Highlights

| Explore Mode                             | Research Mode                              | Feature Explanation                   |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------- |
| ![Explore](docs/screenshots/explore.png) | ![Research](docs/screenshots/research.png) | ![Explain](docs/screenshots/shap.png) |

**Explore Mode** guides users through the full process — from uploading Kepler light curves to interpreting detected exoplanets.
**Research Mode** supports advanced workflows like threshold optimization and model evaluation.
**Feature Analysis** provides SHAP-based insights into feature importance and model confidence.

---

## 🧩 Technical Architecture

```text
Frontend (React + TypeScript + Plotly.js)
        │
        ▼
Backend (FastAPI + Pydantic + AsyncIO)
        │
        ▼
AI Models (Catboost / CatBoost / Scikit-learn)
        │
        ▼
Infrastructure (Redis, MinIO, Docker Compose)
```

**Key technologies:**
React 19 • Ant Design 5 • Plotly.js • FastAPI • Catboost • SHAP • Redis • MinIO • Docker

---

## ⚡ Quick Start

```bash
# Clone the project
git clone https://github.com/LZY00513/exoquest.git
cd exoquest

# Start with Docker
chmod +x start.sh
./start.sh
```

Then open:

* 🌐 Frontend: `http://localhost:5173`
* 🧠 API Docs: `http://localhost:8000/docs`

---

## 🧠 Model Overview

* **Input:** Tabular or light curve data (Kepler/TESS format)
* **Model:** Catboost (optimized with Bayesian tuning)
* **Output:**

  * Confirmed Exoplanet Probability
  * Candidate Probability
  * False Positive Probability
  * SHAP-based Feature Attribution

---

## 🧪 Example Data

**Kepler-452b (sample data)**

```csv
target_name,period,duration_hr,depth_ppm,snr,teff,logg,tmag,crowding
Kepler-452b,384.843,10.1,515.0,12.3,5757,4.32,13.426,0.98
```

**Result Example**

| Confirmed | Candidate | False Positive | Confidence |
| --------- | --------- | -------------- | ---------- |
| 34.8%     | 34.8%     | 0.0%           | 69.6%      |

---

## 🧭 Vision & Impact

> 🛰️ *Making exoplanet discovery accessible for everyone — from classrooms to research labs.*

ExoQuest bridges the gap between **education and scientific research**, helping students understand astrophysical data, and enabling researchers to rapidly prototype detection algorithms.
By integrating explainable AI, it enhances **transparency and trust** in automated exoplanet identification.

---

## 🧱 Repository Structure

```bash
exoquest/
├── frontend/     # React + Ant Design UI
├── api/          # FastAPI backend and ML integration
├── infra/        # Docker Compose & environment configs
└── start.sh      # One-click startup script
```

---

## 👩‍💻 Team & Acknowledgment

Developed by **Team ExoQuest** for NASA Space Apps Challenge 2025.
Thanks to NASA, Kepler, and open-source communities for providing public datasets and tools.

---

## 📜 License

Released under **Apache 2.0 License**.
See [LICENSE](LICENSE) for details.

---

<div align="center">

**🌠 ExoQuest Platform — Explore the Universe with AI.**

*Made with ❤️ for NASA Space Apps Challenge 2025.*

</div>

---

是否希望我再帮你生成一个更短版本（比如 README 精简展示版，150 行以内，专门用于评委浏览移动端 GitHub）？
那种更适合评审快速理解项目亮点。
