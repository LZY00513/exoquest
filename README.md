
# ExoQuest Platform

*A machine learning–based platform for exoplanet detection and analysis*
*Developed for NASA Space Apps Challenge 2025*

---

## Project Overview

**ExoQuest Platform** is an integrated system for exoplanet detection and analysis.
It combines data from NASA’s **Kepler**, **K2**, and **TESS** missions with machine learning and modern visualization tools to support both scientific research and public engagement.

The platform enables users to upload, visualize, and classify light-curve or tabular data, view interpretability results, and export reproducible analyses.
Its dual-mode design—**Explore Mode** and **Research Mode**—caters to both learners and professional researchers.

---

## Platform Highlights

* Automated detection of planetary transits using supervised learning models
* Interactive visualization of light-curve and feature data
* Explainable results with feature-importance analysis
* Support for multi-mission datasets (Kepler, K2, TESS)
* Batch analysis and configurable decision thresholds
* Web-based, containerized architecture for reproducible deployment

---

## Interface Previews

### Landing Page

*Interactive entry point introducing platform modes and research highlights.*
<img width="2048" height="1105" alt="image" src="https://github.com/user-attachments/assets/2e0dd606-d975-43bb-b563-d144b3a5fc02" />


### Explore Mode

*A guided workflow to upload data, visualize transits, run detection, and interpret predictions.*
<img width="1972" height="1084" alt="image" src="https://github.com/user-attachments/assets/81fb6376-0ea6-4638-8cad-893e450067b8" />


### Research Mode

*Batch processing and evaluation interface for large datasets and model performance tuning.*
<img width="1225" height="1090" alt="image" src="https://github.com/user-attachments/assets/159787fb-76c0-43fb-8071-a5cc567d3a37" />


### Single Detection View

*Detailed prediction interface with per-target confidence, probability distribution, and feature explanations.*
<img width="1306" height="1079" alt="image" src="https://github.com/user-attachments/assets/9fab7c37-c9b7-4340-94cb-e815418abd77" />


### About Page  
The main landing interface introducing ExoQuest’s purpose and system modes, providing users with quick access to *Explore Mode*, *Research Mode*, and general platform information.  
<img width="2048" height="1056" alt="image" src="https://github.com/user-attachments/assets/9351b468-9559-496a-856d-8070e7e511c7" />


---

## Core Features

| Category                  | Capability                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| **Detection**             | Identification of exoplanet candidates from light-curve or tabular data |
| **Visualization**         | Phase-folded curve and statistical feature plots                        |
| **Batch Analysis**        | Parallel processing and CSV export                                      |
| **Model Interpretation**  | SHAP-based feature attribution and confidence analysis                  |
| **Retraining (Optional)** | User-initiated fine-tuning and threshold calibration                    |
| **Security**              | Data processed locally or within Docker containers                      |



## Technical Architecture

| Layer | Components |
|--------|-------------|
| 🟦 **Frontend** | React 19 · TypeScript · Ant Design · Plotly.js |
| 🟩 **Backend** | FastAPI · Python 3.11+ · Pydantic · AsyncIO |
| 🟨 **Machine Learning** | CatBoost · Scikit-learn · SHAP |
| 🟪 **Storage & Messaging** | MinIO · Redis |
| 🟥 **Deployment** | Docker Compose (one-click start) |



---

## Dataset Support

* **Kepler** (main mission, 2009–2018)
* **K2** (extended mission with ecliptic fields)
* **TESS** (Transiting Exoplanet Survey Satellite, 2018–present)
* Ground-based observation networks
* User-provided datasets

**Accepted formats:** `.csv`, `.json`, `.fits`, `.txt`

---

## Model Overview

* **Task:** Multi-class classification — *Confirmed Planet*, *Candidate Planet*, *False Positive*
* **Model:** CatBoost (tree-based gradient boosting)
* **Input Features:** orbital period, duration, depth, SNR, temperature, gravity, magnitude, crowding, etc.
* **Outputs:** Class probabilities, confidence score, SHAP feature explanations

**Example Input**

```csv
target_name,period,duration_hr,depth_ppm,snr,teff,logg,tmag,crowding
Kepler-452b,384.843,10.1,515.0,12.3,5757,4.32,13.426,0.98
```

**Example Output**

| Confirmed | Candidate | False Positive | Confidence |
| --------- | --------- | -------------- | ---------- |
| 0.35      | 0.35      | 0.00           | 0.70       |

---

## Workflow Summary

1. Upload or select sample data
2. Preprocess and validate features
3. Run model inference
4. View classification probabilities and SHAP explanations
5. Adjust thresholds or retrain (optional)
6. Export metrics and results

---

## Quick Start

```bash
git clone https://github.com/LZY00513/exoquest.git
cd exoquest

chmod +x start.sh
./start.sh
```

Access locally:

* Frontend: `http://localhost:5173`
* API Docs: `http://localhost:8000/docs`

---

## Evaluation Metrics

* Accuracy, Precision, Recall, F1
* ROC / PR curves
* Confusion matrix and calibration plots
* Versioned result tracking and export

---

## Data and Ethical Notice

All data used are publicly available through NASA archives (Kepler, K2, TESS).
Results generated by ExoQuest are for research and educational purposes only.
NASA does not endorse or sponsor this project; it is an independent open-source initiative.

---

## Open Source

Contributions are welcome through pull requests and discussions on GitHub.
You can find source code, documentation, and issue tracking at:
[https://github.com/LZY00513/exoquest](https://github.com/LZY00513/exoquest)

---

## License

Released under the **Apache 2.0 License**.
See the [LICENSE](LICENSE) file for details.

---

**ExoQuest Platform** – Exploring exoplanetary systems through open, interpretable data science.

