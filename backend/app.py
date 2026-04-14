import eventlet
eventlet.monkey_patch()
from email.mime import text
from fileinput import filename

import psycopg2
 
from flask_cors import CORS
import xml.etree.ElementTree as ET


from flask_mail import Mail, Message
import random
from tax_nlp import get_answer
import requests
from flask import Flask, request, jsonify, session, make_response
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.extras import Json 
from fpdf import FPDF
import os
import razorpay
from dotenv import load_dotenv
from datetime import datetime
import json
from flask_socketio import SocketIO
import google.generativeai as genai

import pytesseract
import pytesseract

 
from PIL import Image
from pdf2image import convert_from_bytes
from io import BytesIO
import re
import pdfplumber
import cv2
import numpy as np


 
load_dotenv()
app = Flask(__name__)
razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Windows madhe Tesseract cha path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(pil_img):
    img = np.array(pil_img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # threshold (important 🔥)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    return thresh

def safe_int(value):
    try:
        return int(value.replace(",", "").strip())
    except:
        return 0


def extract_numbers(text):
    data = {}

    # 🔥 Salary (should be big number)
    salary = re.search(r'Gross\s*Salary.*?([\d,]+)', text, re.IGNORECASE)
    if salary:
        val = safe_int(salary.group(1))
        if val > 10000:   # ✅ filter small गलत numbers
            data["salary"] = val

    # 🔥 Allowances
    hra = re.search(r'Allowances?.*?([\d,]+)', text, re.IGNORECASE)
    if hra:
        val = safe_int(hra.group(1))
        if val > 1000:
            data["exemptAllowances"] = val

    # 🔥 Other Income (Interest etc.)
    other = re.search(r'(Other\s*Sources|Interest).*?([\d,]+)', text, re.IGNORECASE)
    if other:
        val = safe_int(other.group(2))
        if val > 100:
            data["savingsInterest"] = val

    # 🔥 Deductions (80C etc.)
    ded = re.search(r'(80C|Deductions).*?([\d,]+)', text, re.IGNORECASE)
    if ded:
        val = safe_int(ded.group(2))
        if val > 1000:
            data["section80c"] = val

    # 🔥 Tax Payable
    tax = re.search(r'Tax.*?Payable.*?([\d,]+)', text, re.IGNORECASE)
    if tax:
        val = safe_int(tax.group(1))
        if val > 1000:
            data["tax"] = val

    return data

app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_DOMAIN=None
)

active_users = set()
user_sessions = {}

socketio = SocketIO(app, cors_allowed_origins="*")

# 🔐 Session + CORS Config
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_for_local")

CORS(app, resources={
    r"/*": {
        "origins": ["https://tax-assistant1.vercel.app", "http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)
 

# 🔐 reCAPTCHA Secret Key
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET_KEY")

# 📧 Mail Config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USERNAME'] = 'aitaxassistant1@gmail.com'
app.config['MAIL_PASSWORD'] = 'enmyuogxrjmdzyjh'


mail = Mail(app)

otp_store = {}

# 🗄️ DB Connection
def get_db_connection():
    
    db_url = os.getenv("DATABASE_URL")
    
    if db_url:
        return psycopg2.connect(db_url)
    else:
        # फक्त लोकल पासवर्ड 
        return psycopg2.connect(
            host="localhost",
            database="taxdb",
            user="postgres",
            password="iphonex10"
        )
def get_data():
    conn = get_db_connection()
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users")
        return cur.fetchall()
    
    finally:
        conn.close()

def generate_ack():
    now = datetime.now()
    date_part = now.strftime("%Y%m%d")   # 20260322
    random_part = random.randint(10000, 99999)
    return f"ITR{date_part}{random_part}"


def create_invoice_pdf(payment_data, filename):
    pdf = FPDF()
    pdf.add_page()
    
    # --- १. निळी बॉर्डर (Header Line) ---
    pdf.set_fill_color(0, 51, 153) # गडद निळा रंग
    pdf.rect(10, 10, 190, 2, 'F')
    
    # --- २. ब्रँडिंग (Logo & Company Name) ---
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 22)
    pdf.set_text_color(0, 51, 153)
    pdf.cell(100, 10, "Tax Assistant", ln=False)
    
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(90, 10, "E-Payment Services Private Ltd.", ln=True, align='R')
    
    pdf.ln(10)
    
    # --- ३. पावतीचे मुख्य शीर्षक ---
    pdf.set_font("Arial", 'B', 15)
    pdf.cell(190, 10, "STATEMENT / PAYMENT RECEIPT", ln=True, align='C')
    pdf.ln(5)
    
    # --- ४. युझर आणि पेमेंट माहिती (डावी आणि उजवी बाजू) ---
    today_date = datetime.now().strftime("%d-%m-%Y %H:%M")
    
    pdf.set_font("Arial", size=10)
    # डावी बाजू
    pdf.cell(100, 6, f"Customer Name: {payment_data.get('userName', 'User')}", ln=False)
    # उजवी बाजू
    pdf.cell(90, 6, f"Receipt No: {payment_data.get('paymentId', 'N/A')[:12]}", ln=True, align='R')
    
    pdf.cell(100, 6, f"PAN Number: {payment_data.get('pan', 'N/A')}", ln=False)
    pdf.cell(90, 6, f"Date & Time: {today_date}", ln=True, align='R')
    
    pdf.cell(100, 6, f"Assessment Year: {payment_data.get('ay', 'N/A')}", ln=False)
    pdf.cell(90, 6, f"Transaction ID: {payment_data.get('paymentId', 'N/A')}", ln=True, align='R')
    
    pdf.ln(10)

    # --- ५. आयटम टेबल (Table) ---
    # टेबल हेडर
    pdf.set_fill_color(230, 235, 245) # फिकट निळा बॅकग्राउंड
    pdf.set_font("Arial", 'B', 11)
    pdf.cell(130, 10, " Description", border=1, fill=True)
    pdf.cell(60, 10, " Amount (INR)", border=1, fill=True, align='C')
    pdf.ln()

    # टेबल मधील डेटा
    pdf.set_font("Arial", size=11)
    # ओळ १: मुख्य टॅक्स
    pdf.cell(130, 12, f" Income Tax Payment (A.Y. {payment_data.get('ay')})", border=1)
    pdf.cell(60, 12, f" Rs. {payment_data.get('amount')}.00", border=1, align='C')
    pdf.ln()
    
    # ओळ २: प्रोसेसिंग फी
    pdf.cell(130, 12, " Processing Fees / Convenince Fee", border=1)
    pdf.cell(60, 12, " Rs. 0.00", border=1, align='C')
    pdf.ln()

    # ओळ ३: एकूण रक्कम (Total)
    pdf.set_font("Arial", 'B', 12)
    pdf.set_fill_color(245, 245, 245)
    pdf.cell(130, 12, " Total Amount Paid", border=1, fill=True)
    pdf.cell(60, 12, f" Rs. {payment_data.get('amount')}.00", border=1, align='C', fill=True)
    pdf.ln(20)

    # --- ६. डिजिटल सही विभाग (Signature Section) ---
    pdf.set_font("Arial", 'B', 11)
    pdf.cell(190, 8, "For Tax Assistant Services Ltd.", ln=True, align='R')
    
    # सहीसाठी रिकामी जागा (नंतर इमेज ऍड करण्यासाठी)
    pdf.ln(5) 
    pdf.set_font("Arial", 'I', 9)
    pdf.cell(190, 5, "[Digitally Signed]", ln=True, align='R')
    pdf.ln(10)

    # --- ७. कस्टमर सपोर्ट विभाग (Customer Support) ---
    pdf.set_fill_color(240, 240, 240)
    pdf.rect(10, pdf.get_y(), 190, 18, 'F') # राखाडी रंगाचा बॉक्स
    
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(190, 7, "CUSTOMER SUPPORT", ln=True, align='C')
    pdf.set_font("Arial", size=9)
    pdf.cell(190, 5, "If you have any questions, please email us at: support@taxassistant.com", ln=True, align='C')
    pdf.cell(190, 5, "Visit our website: www.taxassistant.co.in", ln=True, align='C')
    
    # --- ८. तळटीप (Footer) ---
    pdf.ln(10)
    pdf.set_font("Arial", 'I', 8)
    pdf.multi_cell(190, 4, "Note: This is a computer-generated receipt and does not require a physical signature. Please keep this for your records.", align='C')
    
    # खालची निळी बॉर्डर
    pdf.set_fill_color(0, 51, 153)
    pdf.rect(10, 280, 190, 2, 'F')

    pdf.output(filename)
# 🤖 Chat API
@app.route("/chat", methods=["POST"])
def chat():
    print("SESSION CONTENT:", session)

    user_email = session.get('user_email')

    if not user_email:
        print("ERROR: User is NOT logged in via session!")
        return jsonify({"reply": "कृपया आधी लॉगिन करा (Session not found)."}), 401

    user_message = request.json.get("message")
    source = request.json.get("source", "chat")  # ✅ NEW
    session_id = request.json.get("sessionId","default_session")

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        # ✅ DIFFERENT PROMPT BASED ON SOURCE
        if source == "voice":
            system_instruction = """
            You are a professional tax expert.
            Always reply in simple English.
            Do not use Marathi or Hindi.
            Keep answers short and clear.
            Do not use symbols like *, #, -, bullets.
            """
        else:
            system_instruction = """
            तू एक प्रोफेशनल टॅक्स एक्सपर्ट आहेस.
            नियम १: युजरने ज्या भाषेत प्रश्न विचारला आहे, त्याच भाषेत उत्तर दे.
            नियम २: उत्तर सोप्या भाषेत आणि bullet points मध्ये दे.
            नियम ३: टॅक्स व्यतिरिक्त इतर प्रश्नांनाही नम्रपणे उत्तर दे.
            """

        ai_resp = model.generate_content(
            f"{system_instruction}\nUser question: {user_message}"
        )

        reply = ai_resp.text if hasattr(ai_resp, "text") else None

        if not reply or reply.strip() == "":
            print("Gemini empty → using dataset")
            reply = get_answer(user_message)

    except Exception as e:
        print(f"Gemini Error: {e}")
        reply = get_answer(user_message)

    if not reply:
        reply = "Sorry, I couldn't understand. Please try again."

    # ✅ ONLY SAVE IF CHAT
    if source == "chat":
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            cur.execute(
                "INSERT INTO chat_history (user_email, session_id, message, sender) VALUES (%s, %s, %s, %s)",
                (user_email,session_id, user_message, 'user')
            )

            cur.execute(
                "INSERT INTO chat_history (user_email, session_id, message, sender) VALUES (%s, %s, %s, %s)",
                (user_email,session_id, reply, 'bot')
            )

            conn.commit()
            cur.close()
            conn.close()

        except Exception as e:
            print(f"Database Error: {e}")

    # ✅ ALWAYS RETURN RESPONSE
    return jsonify({"reply": reply})

@app.route("/get-chat-history", methods=["GET"])
def get_history():
    user_email = session.get('user_email')
    session_id = request.args.get('sessionId')
    conn = get_db_connection()
    # RealDictCursor मुळे डेटा JSON फॉरमॅटमध्ये मिळतो
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT sender, message as text FROM chat_history WHERE user_email = %s AND session_id = %s ORDER BY created_at ASC",
        (user_email, session_id)
    )
    history = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(history)

@app.route("/get-chat-sessions", methods=["GET"])
def get_chat_sessions():
    user_email = session.get('user_email')
    if not user_email:
        return jsonify([])

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # युजरचे फक्त पहिले मेसेजेस (Titles) तारखेनुसार ग्रुप करून आणा
        cur.execute("""
            SELECT DISTINCT ON (session_id) 
            session_id as id, message as title, created_at 
            FROM chat_history 
            WHERE user_email = %s AND sender = 'user'
            ORDER BY session_id, created_at ASC
        """, (user_email,))
        
        sessions = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(sessions)
    except Exception as e:
        print(f"Sessions Error: {e}")
        return jsonify([])

# 📩 Send OTP
@app.route("/send-otp", methods=["POST", "OPTIONS"])
def send_otp():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    try:
        msg = Message(
            'Your Verification OTP',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.body = f"Your OTP is: {otp}"
        mail.send(msg)

        return jsonify({"message": "OTP sent successfully"}), 200

    except Exception:
        return jsonify({"message": "Mail sending failed"}), 500

# 🔐 Verify OTP Email
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    user_otp = data.get('otp')

    if otp_store.get(email) == user_otp:
        return jsonify({"message": "Successful"}), 200
    else:
        return jsonify({"message": "Invalid OTP"}), 400
    
    # 📱 Send Mobile OTP
@app.route("/send-mobile-otp", methods=["POST"])
def send_mobile_otp():
    data = request.get_json()
    mobile = data.get("mobile")

    if not mobile or len(mobile) != 10:
        return jsonify({"message": "Valid mobile number required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[mobile] = otp

    url = "https://www.fast2sms.com/dev/bulkV2"

    payload = {
        "route": "q",   # ✅ Quick SMS
        "message": f"Your OTP is {otp}",  # ✅ IMPORTANT
        "language": "english",
        "numbers": mobile   # ✅ 10 digit number
    }

    headers = {
        "authorization": os.getenv("FAST2SMS_API_KEY"),
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)

        print("SMS API RESPONSE:", response.text)

        return jsonify({"message": "Mobile OTP sent"}), 200

    except Exception as e:
        return jsonify({"message": "SMS failed", "error": str(e)}), 500

@app.route("/verify-mobile-otp", methods=["POST"])
def verify_mobile_otp():
    data = request.get_json()
    mobile = data.get("mobile")
    user_otp = data.get("otp")

    if not mobile or not user_otp:
        return jsonify({"message": "Missing data"}), 400

    stored_otp = otp_store.get(mobile)

    if stored_otp is None:
        return jsonify({"message": "OTP expired or not found"}), 400

    if stored_otp == user_otp:
        del otp_store[mobile]   # ✅ OTP delete after success
        return jsonify({"message": "Mobile Verified"}), 200
    else:
        return jsonify({"message": "Invalid Mobile OTP"}), 400

# 📝 Register
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
        INSERT INTO users 
        (fullname, username, email, mobile, dob, pan, aadhaar, address, password, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data.get('fullname'),
            data.get('username'),
            data.get('email'),
            data.get('mobile'),
            data.get('dob'),
            data.get('pan'),
            data.get('aadhaar'),
            data.get('address'),
            data.get('password'),
            'users'
        )

        cur.execute(query, values)
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": "Registered Successfully"}), 201

    except Exception as e:
        return jsonify({"message": "Registration Failed", "error": str(e)}), 500

# 🔑 LOGIN (with CAPTCHA + SESSION)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    captcha = data.get("captcha")

    # 🔐 CAPTCHA VERIFY
    captcha_verify = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={
            "secret": RECAPTCHA_SECRET,
            "response": captcha
        }
    )

    print("CAPTCHA RESPONSE:", captcha_verify.json())  # DEBUG

    if not captcha_verify.json().get("success"):
        return jsonify({"message": "Captcha verification failed"}), 400

    # 🗄️ DB CHECK
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT email, role FROM users WHERE email=%s AND password=%s",
        (email, password)
    )

    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        # ✅ SESSION SAVE (IMPORTANT FIX)
        session['user_email'] = user[0]
        session.modified = True
        
        print("SESSION AFTER LOGIN:",session)
        # 🔥 ACTIVE USERS ADD
        active_users.add(user[0])

        # 🔥 EMIT LIVE COUNT
        socketio.emit("active_users", {
            "count": len(active_users)
        })

        response = make_response(jsonify({
    "message": "Login Successful",
    "role": user[1]
}))

    return response
    
    return jsonify({"message": "Invalid email or password"}), 401

@socketio.on('connect')
def handle_connect():
    sid = getattr(request, "sid", None)
    email = session.get("user_email")

    if email and sid:
        active_users.add(email)
        user_sessions[sid] = email

    print("ACTIVE USERS:", active_users)

    socketio.emit("active_users", {"count": len(active_users)})


@socketio.on('disconnect')
def handle_disconnect():
    sid = getattr(request, "sid", None)
    email = user_sessions.get(sid)

    if email:
        active_users.discard(email)

    if sid:
        user_sessions.pop(sid, None)

    print("ACTIVE USERS:", active_users)

    socketio.emit("active_users", {"count": len(active_users)})


 


@app.route("/logout", methods=["POST"])
def logout():
    email = session.get("user_email")

    # 🔥 ACTIVE USERS REMOVE
    if email in active_users:
        active_users.remove(email)

    # 🔥 EMIT UPDATE
    socketio.emit("active_users", {"count": len(active_users)})


    # 🔥 clear session
    session.clear()

     

    return jsonify({"message": "Logged out"}), 200

 
# 👤 USER PROFILE
@app.route('/api/user-profile', methods=['GET'])
def get_user_profile():
    print("API HIT")
    # ❗ IMPORTANT FIX (same key use कर)
    user_email = session.get('user_email')

    print("SESSION DATA:", session)  # DEBUG

    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT fullname, pan, mobile, email FROM users WHERE email = %s",
        (user_email,)
    )

    user_data = cur.fetchone()

    cur.close()
    conn.close()

    if user_data:
        return jsonify({
            "name": user_data[0],
            "pan": user_data[1],
            "mobile": user_data[2],
            "email": user_data[3]
        })

    return jsonify({"error": "User not found"}), 404

# 💰 SAVE PAYMENT HISTORY
@app.route('/api/save-payment', methods=['POST'])
def save_payment():
    user_email = session.get('user_email')
    
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    print("Received Payment Data:", data) # Debug साठी

    try:
        # --- १. डेटाबेस सेव्ह (तुमचा जुना कोड) ---
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            INSERT INTO payment_history (user_email, assessment_year, amount, status, payment_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        cur.execute(query, (
            user_email, 
            data.get('ay'), 
            data.get('amount'), 
            data.get('status'), 
            data.get('paymentId')
        ))
        conn.commit()
        cur.close()
        conn.close()
        print("✅ DB Save Success")

        # --- २. PDF बनवा ---
        pdf_filename = f"Tax_Receipt_{data.get('paymentId')}.pdf"
        
        # खात्री करा की 'pan' डेटा मध्ये आहे
        if 'pan' not in data:
            data['pan'] = "N/A" 

        create_invoice_pdf(data, pdf_filename) 
        print(f"✅ PDF Created: {pdf_filename}")

        # --- ३. ईमेल पाठवा ---
        # ❗ 'app.config' ऐवजी तुमचा ईमेल थेट इथे टाका
        YOUR_EMAIL = "aitaxassistant1@gmail.com" 

        msg = Message(
            subject="तुमची टॅक्स पेमेंट पावती - Tax Assistant",
            sender=YOUR_EMAIL, 
            recipients=[user_email]
        )
        
        msg.body = f"नमस्कार, तुमचे ₹{data.get('amount')} चे पेमेंट यशस्वी झाले आहे. पावती सोबत जोडली आहे."
        
        # PDF अटॅचमेंट
        if os.path.exists(pdf_filename):
            with app.open_resource(pdf_filename) as fp:
                msg.attach(pdf_filename, "application/pdf", fp.read())
            
            mail.send(msg)
            print("✅ Email Sent successfully!")
            os.remove(pdf_filename) # फाईल डिलीट करा
        else:
            print("❌ PDF file not found, email sent without attachment")
            mail.send(msg)

        return jsonify({"success": True, "message": "Payment saved and Invoice sent!"}), 200

    except Exception as e:
        print("❌ ERROR DETAILS:", str(e)) # टर्मिनलमध्ये नक्की काय एरर आहे ते दिसेल
        return jsonify({"error": str(e)}), 500

# 📝 SAVE/UPDATE DRAFT (Auto-save)
@app.route('/api/save-draft', methods=['POST'])
def save_draft():
    user_email = session.get('user_email')
    
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() # याच्या आत formData नावाचा object असेल
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # ON CONFLICT वापरल्यामुळे एका युझरचा जुना ड्राफ्ट अपडेट होईल
        query = """
            INSERT INTO user_drafts (user_email, form_data)
            VALUES (%s, %s)
            ON CONFLICT (user_email) 
            DO UPDATE SET form_data = EXCLUDED.form_data, updated_at = CURRENT_TIMESTAMP
        """
        cur.execute(query, (user_email, Json(data.get('formData'))))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "Draft auto-saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📊 GET HISTORY & DRAFT (Dashboard साठी)
@app.route('/api/get-user-data', methods=['GET'])
def get_user_data():
    user_email = session.get('user_email')
    
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # पेमेंट हिस्ट्री फेच करा
        cur.execute("SELECT assessment_year, amount, status, payment_id, created_at FROM payment_history WHERE user_email = %s ORDER BY created_at DESC", (user_email,))
        history_data = cur.fetchall()
        
        # ड्राफ्ट फेच करा
        cur.execute("SELECT form_data FROM user_drafts WHERE user_email = %s", (user_email,))
        draft_data = cur.fetchone()
        
        cur.close()
        conn.close()

        # डेटा व्यवस्थित फॉरमॅट करा
        history = []
        for row in history_data:
            history.append({
                "ay": row[0],
                "amount": float(row[1]),
                "status": row[2],
                "paymentId": row[3],
                "date": row[4].strftime("%d-%m-%Y")
            })

        return jsonify({
            "history": history,
            "draft": draft_data[0] if draft_data else None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/get-user", methods=["GET"])
def get_user():
    email = session.get("user_email")   # 👈 IMPORTANT CHANGE

    if not email:
        return jsonify({"error": "User not logged in"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT fullname, email, pan, aadhaar, mobile, address
        FROM users 
        WHERE email=%s
    """, (email,))

    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        return jsonify({
            "name": user[0],
            "email": user[1],
            "pan": user[2],
            "aadhaar": user[3],
            "mobile": user[4],
            "address": user[5]
        })
    else:
        return jsonify({"error": "User not found"}), 404
    
@app.route("/submit-itr", methods=["POST"])
def submit_itr():
    data = request.get_json()

    email = session.get("user_email")   

    if not email:
        return jsonify({"error": "User not logged in"}), 401

    ack_no = generate_ack()

    try:
        conn = get_db_connection()   
        cur = conn.cursor()

        query = """
        INSERT INTO itr_forms (ack_no, email, data)
        VALUES (%s, %s, %s)
        """

        cur.execute(query, (ack_no, email, json.dumps(data)))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "ITR Submitted Successfully",
            "acknowledgement": ack_no
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-itr-list", methods=["GET"])
def get_itr_list():
    from flask import session

    email = session.get("user_email")

    if not email:
        return jsonify({"error": "User not logged in"}), 401

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT ack_no, data, created_at
            FROM itr_forms
            WHERE email = %s
            ORDER BY created_at DESC
        """, (email,))

        rows = cur.fetchall()

        result = []
        for row in rows:
            data = row[1]

            result.append({
                "ack_no": row[0],
                "itrType": data.get("basic", {}).get("itrType"),
                "assessmentYear": data.get("basic", {}).get("assessmentYear"),
                "date": row[2]
            })

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

  
@app.route("/upload-doc", methods=["POST"])
def upload_doc():
    try:
        file = request.files.get("file")
        doc_type = request.form.get("doc_type")

        if not file or not file.filename:
            return jsonify({"error": "No file"}), 400

        file_bytes = file.read()
        text = ""
        filename = file.filename.lower()

        # 📄 PDF → text + OCR fallback
        if filename.endswith(".pdf"):
            import pdfplumber
            from pdf2image import convert_from_bytes

            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""

            # 🔥 अगर text empty → OCR fallback
            if not text.strip():
                print("⚠️ pdfplumber failed → using OCR")

                images = convert_from_bytes(file_bytes, dpi=300)
                for img in images:
                    processed = preprocess_image(img)
                    text += pytesseract.image_to_string(processed, config='--psm 6')

        # 🖼 IMAGE → OCR
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            image = Image.open(BytesIO(file_bytes))
            text =  pytesseract.image_to_string(image, config='--oem 3 --psm 6')
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        # 🔥 CLEAN TEXT
        text = text.replace("\n", " ")
        print("TEXT PREVIEW:", text[:300])

        # 🤖 PROMPT
        prompt = f"""
You are an expert Tax Assistant. Your task is to extract data from the provided Form 16 text for ITR-1 filing.

INSTRUCTIONS:
1. Extract ALL numerical values accurately. 
2. If "Deductions under Chapter VI-A" is found, map it carefully:
   - Identify "Section 80C" (PF, LIC, PPF) and put it in "section80c".
   - Identify "Section 80D" (Health Insurance) and put it in "section80d".
   - Identify "Section 80TTA" (Interest on savings bank) and put it in "section80tta".
3. If only a total deduction is shown (e.g., 1,85,000) without a split:
   - Assume up to 1,50,000 is for "section80c" and the rest for "section80d".
4. If "Interest" or "Other Income" is found, map it to "savingsInterest".
5. Return ONLY a valid JSON object. No conversational text, no markdown code blocks (```json).
6. Use 0 if a value is not found.
Analyze the Form 16 / Document and extract House Property details.

SPECIAL INSTRUCTIONS:
1. Look for "Gross Rent received" or "Annual Value" and put it in "grossRent".
2. Look for "Municipal Taxes paid" and put it in "municipalTax".
3. If rent is found, set "propertyType" to "letout", else "self".
4. Extract "Interest on Housing Loan" into the "interest" field.

JSON SCHEMA:
{{
  "salary": number,
  "perquisites": number,
  "profits": number,
  "exemptAllowances": number,
  "propertyType": "self",
  "grossRent": number,
  "municipalTax": number,
  "interest": number,
  "savingsInterest": number,
  "fdInterest": number,
  "refundInterest": number,
  "familyPension": number,
  "section80c": number,
  "section80d": number,
  "section80tta": number
   "salary": number,
  "propertyType": "self" or "letout",
  "grossRent": number,
  "municipalTax": number,
  "interest": number,
}}

TEXT:
{text}
"""

        # 🤖 GEMINI CALL
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        ai_text = response.text

        print("RAW AI:", ai_text)

        # 🔥 PARSE JSON
        data = {}
        try:
            if ai_text:
                ai_text = ai_text.strip()

                if ai_text.startswith("```"):
                    ai_text = "\n".join(ai_text.split("\n")[1:])
                if ai_text.endswith("```"):
                    ai_text = "\n".join(ai_text.split("\n")[:-1])

                ai_text = ai_text.strip()
                data = json.loads(ai_text)

        except Exception as e:
            print("JSON ERROR:", e)
            data = {}

        # 🔥 REGEX (ALWAYS RUN)
        regex_data = extract_numbers(text)
        print("REGEX DATA:", regex_data)

        for key in regex_data:
            if key not in data or data[key] == 0:
                data[key] = regex_data[key]
                 

        # ✅ DEFAULT DATA
        default_data = {
            "salary": 0,
            "perquisites": 0,
            "profits": 0,
            "exemptAllowances": 0,
            "propertyType": "self",
            "grossRent": 0,
            "municipalTax": 0,
            "interest": 0,
            "savingsInterest": 0,
            "fdInterest": 0,
            "refundInterest": 0,
            "familyPension": 0,
            "section80c": 0,
            "section80d": 0,
            "section80tta": 0
        }

         # ✅ DEFAULT DATA
        for key in default_data:
            if key not in data or data[key] is None:
                data[key] = default_data[key]

# ✅ IMPORTANT: loop संपल्यावरच calculate कर
        data["otherIncome"] = (
    (data.get("savingsInterest") or 0) +
    (data.get("fdInterest") or 0) +
    (data.get("refundInterest") or 0) +
    (data.get("familyPension") or 0)
)

        print("FINAL JSON:", data)
        return jsonify(data)

    except Exception as e:
        print("FINAL ERROR:", e)
        return jsonify({"error": "Server failed"}), 500
    
@app.route("/rss", methods=["GET"])
def rss_feed():
    try:
        url = "https://news.google.com/rss/search?q=income+tax+India&hl=en-IN&gl=IN&ceid=IN:en"
        response = requests.get(url)
        response.raise_for_status()

        root = ET.fromstring(response.text)
        items = []
        for item in root.findall(".//item")[:10]:
            title_el = item.find("title")
            link_el = item.find("link")
            date_el = item.find("pubDate")

            title = title_el.text if title_el is not None else ""
            link = link_el.text if link_el is not None else ""
            date = date_el.text if date_el is not None else ""

            items.append({"title": title, "link": link, "date": date})

        return jsonify(items)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/videos", methods=["GET"])
def videos():
    return jsonify([
        {
            "title": "How to file ITR-1 online (AY 2025-26)",
            "url": "https://www.youtube.com/watch?v=JjvZkXy7oYw"
        },
        {
            "title": "How to file ITR-4 online",
            "url": "https://www.youtube.com/watch?v=KkXcZp9LmQw"
        },
        {
            "title": "How to pay Income Tax Online",
            "url": "https://www.youtube.com/watch?v=ZzYkLmXc456"
        },
        {
            "title": "Instant PAN allotment through Aadhaar",
            "url": "https://www.youtube.com/watch?v=MnXcYwZk789"
        }
    ])

@app.route("/admin/tax-records")
def get_records():
    conn = get_db_connection()
    cur = conn.cursor()

    # 👉 ITR data
    cur.execute("SELECT email, data FROM itr_forms")
    itr_rows = cur.fetchall()

    # 👉 Payment data
    cur.execute("SELECT user_email, assessment_year, amount, status, created_at FROM payment_history")
    payment_rows = cur.fetchall()

    # 🔥 payment map (fast lookup)
    payment_map = {
        (p[0], str(p[1])): p   # 👈 string match fix
        for p in payment_rows
    }

    result = []

    for itr in itr_rows:
        email = itr[0]
        data = itr[1]   # ✅ FIXED

        # 🔐 safe access (error avoid)
        year = str(data.get("basic", {}).get("assessmentYear"))

        key = (email, year)

        if key in payment_map:
            pay = payment_map[key]

            result.append({
                "email": email,
                "year": year,
                "income": data.get("tax", {}).get("totalIncome", 0),
                "tax": data.get("tax", {}).get("finalTax", 0),
                "paid": pay[2],
                "status": pay[3],
                "date": str(pay[4])
            })

    cur.close()
    conn.close()

    return jsonify(result)
# 🚀 RUN
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)