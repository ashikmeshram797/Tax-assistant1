 #!/usr/bin/env bash
# Exit on error
set -o errexit

# १. Tesseract OCR इन्स्टॉल करा
apt-get update && apt-get install -y tesseract-ocr

# २. Python लायब्ररीज इन्स्टॉल करा
pip install -r requirements.txt

# ३. जर तुमची कोणतीही 'build' स्क्रिप्ट नसेल, तर पुढच्या ओळी काढून टाका.
# फक्त बॅकएंड असेल तर npm ची गरज नाही.