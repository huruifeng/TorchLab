# TorchLab

TorchLab is an interactive platform for designing, training and evaluating deep-learning models. It combines a Python (FastAPI-based) backend for computation with a modern React + TypeScript front-end that lets you build neural networks graphically and track experiments end-to-end.

---

## Table of Contents
1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
   * [Backend](#backend-setup)
   * [Frontend](#frontend-setup)
5. [Running the App Locally](#running-the-app-locally)
6. [Scripts & Tasks](#scripts--tasks)
7. [Testing](#testing)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features
* **Visual Network Editor** – Drag-and-drop layers, draw connections and configure hyper-parameters in real-time.
* **PyTorch Backend** – Leverages the full power of the PyTorch ecosystem for training and inference.
* **Live Metrics & Visualization** – Watch loss/accuracy curves update as training progresses.
* **Experiment Tracking** – Save and load experiments, compare runs and export trained models.
* **Modular Architecture** – Clean separation between backend and frontend for easy customization.

## Project Structure
```
TorchLab/
├── backend/            # Python source code
│   └── funcs/
│       └── network.py  # Core model-building helpers
├── frontend/           # React + TypeScript app (Vite / CRA)
│   └── src/
│       ├── components/
│       │   ├── NetworkEditor.tsx
│       │   └── network/
│       │       └── ConnectionLine.tsx
│       └── pages/
│           └── Editor.tsx
├── README.md
└── ...
```

### Backend
The backend exposes a REST/WS API (e.g. FastAPI) that accepts JSON descriptions of neural networks, builds them with PyTorch and streams training statistics back to the client.

### Frontend
The React app provides an intuitive canvas-based UI for editing the computational graph. State management is handled with **Zustand** and styling via **Tailwind CSS**/**Shadcn UI**.

## Prerequisites
| Tool              | Version (recommended) |
|-------------------|-----------------------|
| Python            | 3.9+                  |
| Node.js & npm     | 16+ (or Yarn 1.22+)   |
| Git               | Latest                |

> 📌 If you plan to use GPU acceleration, ensure you have CUDA-enabled PyTorch installed that matches your driver & toolkit.

## Getting Started
### 1. Clone the repository
```bash
$ git clone https://github.com/huruifeng/TorchLab.git
$ cd TorchLab
```

### 2. Backend Setup
<a name="backend-setup"></a>
```bash
# create virtual environment with Conda (optional but recommended)
conda create -n torchlab python=3.9
conda activate torchlab

# install dependencies
pip install -r backend/requirements.txt

# install PyTorch
[Please refer to PyTorch installation guide](https://pytorch.org/get-started/locally/) 

# verify installation
python -c "import torch; print(torch.__version__)"
```

### 3. Frontend Setup
<a name="frontend-setup"></a>
```bash
cd frontend
npm install   # or: yarn install
```

## Running the App Locally
<a name="running-the-app-locally"></a>
Run backend and frontend in two separate terminals:

```bash
# Terminal 1 – backend (from repository root)
python -m backend.main:app  # or: python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --proxy-headers >> backend.log

# Terminal 2 – frontend
cd frontend
npm run dev           # Vite dev server
```

Then open [http://localhost:3000](http://localhost:3000) (or the port shown) in your terminal/browser. 
Confirm that the editor loads and can communicate with the backend (check browser dev-tools console for API calls).

## Scripts & Tasks
| Command                       | Location   | Description                              |
|-------------------------------|------------|------------------------------------------|
| `pip install -r requirements` | backend    | Install Python dependencies              |
| `python -m backend.main:app`  | backend    | Launch REST/WS server                    |
| `npm install`                 | frontend   | Install React dependencies               |
| `npm run dev`                 | frontend   | Start React dev server with hot reload   |
| `npm run build`               | frontend   | Build production-ready static assets     |
| `npm test`                    | frontend   | Run front-end unit + integration tests   |

## Testing
* **Backend** – pytest test suites reside in `backend/tests/`.
* **Frontend** – Vitest Library tests live in `frontend/src/__tests__/`.

Run all tests:
```bash
# backend
pytest -q

# frontend
npm test
```

## Contributing
1. Fork the repo & create your feature branch (`git checkout -b feature/my-awesome-feature`).
2. Commit your changes with concise messages.
3. Open a Pull Request targeting `main` and fill out the PR template.
4. Ensure GitHub Actions CI passes (lint + tests) before requesting review.

We welcome bug reports, feature requests and documentation improvements!

## License
TorchLab is released under the MIT License – see the [LICENSE](LICENSE) file for details.

---

### Acknowledgements
Built with ♥ by the TorchLab community, powered by [PyTorch](https://pytorch.org/) and [React](https://reactjs.org/).