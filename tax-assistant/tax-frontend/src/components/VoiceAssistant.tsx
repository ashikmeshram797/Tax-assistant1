 import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaMicrophone } from "react-icons/fa";
import "./VoiceAssistant.css";
import robotLogo from "../assets/robot-logo.png";
import { useVoice } from "../context/VoiceContext";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const [isActivated, setIsActivated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { setVoiceField } = useVoice();
  
  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) return;
    synth.cancel();

    const speakNow = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;

      const cleanText = text.replace(/[*#_\-•]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setTimeout(() => setIsSpeaking(false), 500);

      let voice = voices.find(v => v.name.includes("Aria")) || 
                  voices.find(v => v.name.includes("Google")) || 
                  voices[0];

      utterance.voice = voice;
      utterance.lang = voice.lang || "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;

      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }
  };

  const startAssistant = () => {
    let hasSpoken = false;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    const clickBtn = (text: string) => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => 
        el.textContent?.toLowerCase().includes(text.toLowerCase())
      );
      if (btn) (btn as HTMLElement).click();
    };

    const fillField = (searchTerms: string[], value: string) => {
      const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
      const input = allInputs.find(i => 
        searchTerms.some(term => 
          i.getAttribute('name')?.toLowerCase().includes(term) || 
          i.id?.toLowerCase().includes(term) ||
          (i as HTMLInputElement).placeholder?.toLowerCase().includes(term)
        )
      );
      if (input) {
        (input as HTMLInputElement).value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Assistant is listening...");
    };

    recognition.onresult = async (event: any) => {
      if (hasSpoken) return;
hasSpoken = true;
      
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("User said:", command);
      setIsListening(false);
      recognition.stop();

       

      if (command.includes("stop") || command.includes("shut up") || command.includes("थांब")) {
        speak("Goodbye!");
        setIsListening(false);
        recognition.stop();
        return;
      }

      if (command.includes("tax ai") && !isActivated) {
        setIsActivated(true);
        speak("Hello, I am Tax AI. How can I help you?");
        return;
      }
      if (!isActivated) {
        speak("Please say Tax AI to activate me");
        return;
      }

      // --- Navigation ---
      if (command.includes("dashboard")) { speak("Opening Dashboard"); navigate("/dashboard"); return; }
      if (command.includes("file itr")) { speak("Opening ITR filing"); navigate("/file-return"); return; }
      if (command.includes("pay tax") || command.includes("e-pay")) { speak("Opening e-pay tax"); navigate("/e-pay-tax"); return; }

      // --- Buttons ---
      if (command.includes("confirm and next") || command.includes("confirm next")) { speak("Confirming"); clickBtn("Confirm & Next"); return; }
      else if (command.includes("new payment") || command.includes("add payment")) { speak("New payment"); clickBtn("+New Payment"); return; }
      else if (command.includes("proceed")) { speak("Proceeding"); clickBtn("Proceed"); return; }
      else if (command.includes("confirm") || command.includes("next")) { clickBtn("Next"); return; }
      else if (command.includes("back") || command.includes("previous")) { clickBtn("Back"); return; }
      else if (command.includes("preview")) { clickBtn("Preview"); return; }
      else if (command.includes("submit")) { clickBtn("Submit ITR"); return; }
      else if (command.includes("pay now")) { clickBtn("Pay Now"); return; }
      else if (command.includes("calculate")) { clickBtn("Calculate"); return; }

      // --- Fields ---
      if (command.includes("name is")) { fillField(["name"], command.split("is")[1].trim()); return; }
      else if (command.includes("pan is")) { fillField(["pan"], command.split("is")[1].trim().toUpperCase()); return; }
      else if (command.includes("aadhaar is")) { fillField(["aadhaar"], command.split("is")[1].trim()); return; }
      else if (command.includes("email is")) { fillField(["email"], command.split("is")[1].trim()); return; }
      else if (command.includes("account number is")) { fillField(["account"], command.split("is")[1].trim()); return; }
      else if (command.includes("ifsc code is")) { fillField(["ifsc"], command.split("is")[1].trim().toUpperCase()); return; }

       const amountMatch = command.match(/\d+/g);
  let amount: string | null = amountMatch ? amountMatch[0] : null;

  if (amount) {
    let numericAmount = parseInt(amount);
    if (command.includes("thousand") || command.includes("हजार")) {
      numericAmount = numericAmount * 1000;
    } else if (command.includes("lakh") || command.includes("लाख")) {
      numericAmount = numericAmount * 100000;
    }
    amount = numericAmount.toString();
  }
      if (amount) {
        if (command.includes("salary")) {
          const success = fillField(["salary"], amount);
          if (success) {setVoiceField("income", "salary", Number(amount)); speak("Salary updated successfully"); return; }
        }
        else if (command.includes("perquisites")) { fillField(["perquisites"], amount);setVoiceField("income", "perquisites", Number(amount)); speak("Perquisites set"); return; }
        else if (command.includes("profits")) { fillField(["profits"], amount);setVoiceField("income", "profits", Number(amount)); speak("Profits set"); return; }
        else if (command.includes("rent")) { fillField(["grossrent", "rent"], amount); setVoiceField("house", "grossRent", Number(amount)); speak("Rent set"); return; }
        else if (command.includes("municipal tax")) { fillField(["municipaltax", "municipal"], amount); setVoiceField("house", "municipalTax", Number(amount)); speak("Municipal tax set"); return; }
        else if (command.includes("interest on housing loan")) { fillField(["interest"], amount); setVoiceField("house", "interest", Number(amount)); speak("Housing Loan interest set"); return; }
        else if (command.includes("savings interest")) { fillField(["savingsinterest"], amount); setVoiceField("other", "savingsInterest", Number(amount)); speak("Savings interest set"); return; }
        else if (command.includes("fd interest")) { fillField(["fdinterest"], amount); setVoiceField("other", "fdInterest", Number(amount)); speak("FD interest set"); return; }
        else if (command.includes("income tax refund interest")) { fillField(["incomeTaxRefundInterest"], amount); setVoiceField("other", "refundInterest", Number(amount)); speak("Refund interest set"); return; }
        else if (command.includes("pension")) { fillField(["familypension"], amount); setVoiceField("other", "familyPension", Number(amount)); speak("Pension set"); return; }
        else if (command.includes("sale consideration")) { fillField(["saleConsideration"], amount); setVoiceField("capitalGains", "saleConsideration", Number(amount)); speak("Sale consideration set"); return; }
        else if (command.includes("cost of acquisition")) { fillField(["costAcquisition"], amount); setVoiceField("capitalGains", "costAcquisition", Number(amount)); speak("Cost of acquisition set"); return; }
        else if (command.includes("80c")) { fillField(["deduction80c", "section80c"], amount); setVoiceField("deductions", "deduction80C", Number(amount)); speak("80C deduction set"); return; }
        else if (command.includes("80d")) { fillField(["deduction80d", "section80d"], amount); setVoiceField("deductions", "deduction80D", Number(amount)); speak("80D deduction set"); return; }
        else if (command.includes("80tta")) { fillField(["deduction80tta", "section80tta"], amount); setVoiceField("deductions", "deduction80TTA", Number(amount)); speak("80TTA deduction set"); return; }
        else if (command.includes("interest on borrowed capital")) { fillField(["borrowedCapitalInterest"], amount); setVoiceField("loan", "borrowedCapitalInterest", Number(amount)); speak("Borrowed capital interest set"); return; }
        else if (command.includes("loan outstanding")) { fillField(["outstandingAmount"], amount); setVoiceField("loan", "outstandingAmount", Number(amount)); speak("Loan outstanding set"); return; }
        else if (command.includes("total loan amount")) { fillField(["totalLoanAmount"], amount); setVoiceField("loan", "totalLoanAmount", Number(amount)); speak("Total loan amount set"); return; }
        else if (command.includes("loan account number")) { fillField(["loanAccountNumber"], amount); setVoiceField("loan", "loanAccountNumber", Number(amount)); speak("Loan account number set"); return; }
        else if (command.includes("bank name")) { fillField(["bankName"], command.split("is")[1].trim()); return; }

        const breakup = document.querySelectorAll('.breakup-row input');
        if (breakup.length >= 0) {
          if (command.includes("tax amount") || command.includes("basic tax")) { if(breakup[6]) { (breakup[6] as HTMLInputElement).value = amount; breakup[6].dispatchEvent(new Event('change', { bubbles: true })); speak("Tax set"); return; } }
          else if (command.includes("surcharge")) { if(breakup[5]) { (breakup[5] as HTMLInputElement).value = amount; breakup[5].dispatchEvent(new Event('change', { bubbles: true })); speak("Surcharge set"); return; } }
          else if (command.includes("cess")) { if(breakup[1]) { (breakup[1] as HTMLInputElement).value = amount; breakup[1].dispatchEvent(new Event('change', { bubbles: true })); speak("Cess set"); return; } }
          else if (command.includes("interest amount")) { if(breakup[2]) { (breakup[2] as HTMLInputElement).value = amount; breakup[2].dispatchEvent(new Event('change', { bubbles: true })); speak("Interest set"); return; } }
          else if (command.includes("penalty") || command.includes("fine")) { if(breakup[4]) { (breakup[4] as HTMLInputElement).value = amount; breakup[4].dispatchEvent(new Event('change', { bubbles: true })); speak("Penalty set"); return; } }
          else if (command.includes("others")) { if(breakup[3]) { (breakup[3] as HTMLInputElement).value = amount; breakup[3].dispatchEvent(new Event('change', { bubbles: true })); speak("Others set"); return; } }
        }

        if (command.includes("salary") || command.includes("pension") || command.includes("interest") || command.includes("80") || command.includes("rent") || command.includes("tax")) return;
      }

      if (command.length < 3) return;
      try {
        const res = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: command, source: "voice" }),
        });
        const data = await res.json();
        speak(data.reply || "Sorry, I did not understand");
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isActivated) {
      
      }
    };

    recognition.start();
  };

  return (
    <div 
      onClick={startAssistant} 
      className={`robot-floating ${isSpeaking ? "robot-speaking" : ""} ${isListening ? "listening-pulse" : ""}`}
      style={{
        position: "fixed", bottom: "30px", right: "30px", width: "120px", height: "120px", 
        display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", zIndex: 10000, transition: "all 0.3s ease"
      }}
    >
      {isSpeaking && <div className="speaking-glow"></div>}
      <img src={robotLogo} alt="Robot" style={{ width: "100%", height: "100%", objectFit: "contain", filter: isSpeaking ? "drop-shadow(0 0 20px #3b82f6)" : isListening ? "drop-shadow(0 0 15px #ef4444)" : "none" }} />
      {isListening && !isSpeaking && (
        <div style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", borderRadius: "50%", padding: "6px", display: "flex", boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}>
          <FaMicrophone size={14} color="white" />
        </div>
      )}
    </div>
  );
}