 #!/usr/bin/env bash

# Exit on error
set -o errexit

# Install Tesseract OCR
apt-get install -y tesseract-ocr

# Install Python packages
pip install -r requirements.txt