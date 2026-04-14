 #!/usr/bin/env bash
# काही एरर आला तर स्क्रिप्ट थांबवण्यासाठी
set -o errexit

# १. Tesseract OCR इन्स्टॉल करा (PDF साठी)
apt-get update && apt-get install -y tesseract-ocr

# २. Python च्या सर्व लायब्ररीज इन्स्टॉल करा
pip install -r requirements.txt

# ३. जर तुझे Frontend आणि Backend एकाच ठिकाणी असतील, तर Node modules इन्स्टॉल करा
# (हे तुझ्या .tsx फाईल्ससाठी आवश्यक आहे)
npm install
npm run build