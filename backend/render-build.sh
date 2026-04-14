 #!/usr/bin/env bash

# Exit on error
set -o errexit

# Install Tesseract OCR
pip install -y tesseract-ocr || true

# Install Python packages
pip install -r requirements.txt