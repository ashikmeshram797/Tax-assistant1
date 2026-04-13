 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios"
import './FileITR.css';
import { useVoice } from "../context/VoiceContext";
import api from '../services/api';

 

 type AIData = {
  salary?: number;
  section80c?: number;
  section80d?: number;
  section80tta?: number;
  exemptAllowances?: number;
  interest?: number;
  otherIncome?: number

  savingsInterest?: number;
  fdInterest?: number;
  refundInterest?: number;
  familyPension?: number;
  grossRent?: number;
  municipalTaxes?: number;
  propertyType?: string;
  perquisites?: number;

};

type Personal = {
  name: string;
  email: string;
  pan: string;
  aadhaar: string;
  mobile: string;
  address: string;
};

type Bank = {
  account: string;
  ifsc: string;
  branch: string;
};

 type Income = {
  salary: number;
  perquisites: number;
  profits: number;
  exemptions: {
    id: number;
    nature: string;
    amount: number;
  }[];   // ✅ array type
  finalSalaryIncome: number;
};

type House = {
  propertyType: string;
  grossRent: number;
  municipalTax: number;
  interest: number;
  incomeFromHouse: number;
};

type Other = {
  savingsInterest: number;
  fdInterest: number;
  incomeTaxRefundInterest: number;
  familyPension: number;
  total: number;
  
};

type Deductions = {
  deduction80C: number;
  deduction80D: number;
  deduction80TTA: number;
};

type Tax = {
  totalIncome: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  finalTax: number;
};

const FileITR: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentYear, setAssessmentYear] = useState('');
  const [filingMode, setFilingMode] = useState('Online');
  const [filingType, setFilingType] = useState('');
  const [isAudited, setIsAudited] = useState('');
  const [itrType, setItrType] = useState('');
  const [years, setYears] = useState<string[]>([]);
  const [salary, setSalary] = useState<number>(0);
const [perquisites, setPerquisites] = useState<number>(0);
const [profits, setProfits] = useState<number>(0);
const [exemptAllowances, setExemptAllowances] = useState([{ id: Date.now(), nature: '', amount: 0 }]);
const [showMoreFields, setShowMoreFields] = useState(false);
const [deduction80C, setDeduction80C] = useState(0);
const [deduction80D, setDeduction80D] = useState(0);
const [deduction80TTA, setDeduction80TTA] = useState(0);
const [totalLoanAmount, setTotalLoanAmount] = useState(0);
const [outstandingAmount, setOutstandingAmount] = useState(0);
const [loanAccountNumber, setLoanAccountNumber] = useState("");
const [saleConsideration, setSaleConsideration] = useState<number>(0);
const [costAcquisition, setCostAcquisition] = useState<number>(0);

const [bankAccount, setBankAccount] = useState("");
const [selectedDocType, setSelectedDocType] = useState("");
 const [file, setFile] = useState<File | null>(null);


const [confirmAccount, setConfirmAccount] = useState("");
const [ifsc, setIfsc] = useState("");
const [branch, setBranch] = useState("");

const [propertyType, setPropertyType] = useState("");
const [grossRent, setGrossRent] = useState(0);
const [municipalTax, setMunicipalTax] = useState(0);
const [interest, setInterest] = useState(0);
const [borrowedCapitalInterest, setBorrowedCapitalInterest] = useState<number>(0);
const [showBreakupForm, setShowBreakupForm] = useState<boolean>(false);
const [otherSourcesIncome, setOtherSourcesIncome] = useState<number>(0);
const [showOtherBreakup, setShowOtherBreakup] = useState<boolean>(false);
const [ackNo, setAckNo] = useState("");
const { voiceData } = useVoice();



 const [itrData, setItrData] = useState<{
  basic: {
    assessmentYear: string;
    filingType: string;
    itrType: string;
  };
  personal: Personal;
  bank: Bank;
  income: Income;
  house: House;
  other: Other;
  deductions: Deductions;
  tax: Tax;
}>({
  basic: {
    assessmentYear: "",
    filingType: "",
    itrType: ""
  },
  personal: {
    name: "",
    email: "",
    pan: "",
    aadhaar: "",
    mobile: "",
    address: ""
  },
  bank: {
    account: "",
    ifsc: "",
    branch: ""
  },
  income: {
    salary: 0,
    perquisites: 0,
    profits: 0,
    exemptions: [],
    finalSalaryIncome: 0
  },
  house: {
    propertyType: "",
    grossRent: 0,
    municipalTax: 0,
    interest: 0,
    incomeFromHouse: 0
  },
  other: {
    savingsInterest: 0,
    fdInterest: 0,
    incomeTaxRefundInterest: 0,
    familyPension: 0,
    total: 0
  },
  deductions: {
    deduction80C: 0,
    deduction80D: 0,
    deduction80TTA: 0
  },
  tax: {
    totalIncome: 0,
    taxableIncome: 0,
    taxBeforeRebate: 0,
    rebate: 0,
    taxAfterRebate: 0,
    cess: 0,
    finalTax: 0
  }
});

const [userData, setUserData] = useState({
  name: "",
  email: "",
  pan: "",
  aadhaar: "",
  mobile: "",
  address: ""   // 👈 add this
});

const saveStep0 = () => {
  setItrData(prev => ({
    ...prev,
    basic: {
      assessmentYear,
      filingType,
      itrType
    }
  }));

  setStep(1);
};

const saveStep1 = () => {
  setItrData(prev => ({
    ...prev,
    personal: userData,
    bank: {
      account: bankAccount,
      ifsc: ifsc,
      branch: branch
    }
  }));

  setStep(2);
};

const saveStep2 = () => {
  setItrData(prev => ({
    ...prev,
    income: {
      salary,
      perquisites,
      profits,
      exemptions: exemptAllowances,
      finalSalaryIncome
    }
  }));

  setStep(3);
};

const saveStep3 = () => {
  setItrData(prev => ({
    ...prev,
    house: {
      propertyType,
      grossRent,
      municipalTax,
      interest,
      incomeFromHouse
    }
  }));

  setStep(4);
};

 const saveStep4 = () => {
  setItrData(prev => ({
    ...prev,
    interest: {
      borrowedCapitalInterest,
      breakupData
    }
  }));

  setStep(5);
};



const saveStep5 = () => {
  setItrData(prev => ({
    ...prev,
    other: {
      ...otherBreakup,
      total: otherSourcesIncome
    }
  }));

  setStep(6);
};

 const saveStep6 = () => {
  setItrData(prev => ({
    ...prev,
    deductions: {
      deduction80C,
      deduction80D,
      deduction80TTA
    },
    tax: {
      totalIncome,
      taxableIncome,
      taxBeforeRebate,
      rebate,
      taxAfterRebate,
      cess,
      finalTax,
      slab1Tax,
      slab2Tax,
      slab3Tax,
      slab4Tax,
      slab5Tax
    }
  }));

  setStep(7);
};

 
 const handleUpload = async () => {
  if (!file) {
    alert("File select kar");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("doc_type", selectedDocType);

  try {
    const res = await api.post<AIData>(
      "/upload-doc",
      formData,
      {        headers: {
          "Content-Type": "multipart/form-data",

        },
      }
    );

    const data: AIData = res.data;
    console.log("AI DATA RECEIVED:", data);

    // --- STEP 2: Salary Income ---
    setSalary(data.salary || 0);
     setExemptAllowances([
  { 
    id: Date.now(), 
    nature: 'Exempt Allowance (AI Extracted)', 
    amount: data.exemptAllowances || 0 
  }
]);
    // जर परक्विसिट्स असतील तर:
     setPerquisites(data.perquisites || 0);

    // --- STEP 3 & 4: House Property (Interest) ---
    // जर फॉर्ममध्ये होम लोन इंटरेस्ट असेल तर तो इथे सेट होईल
    if (data.propertyType === "letout") {
  setPropertyType("letout"); // तुमची स्टेट
  setGrossRent(data.grossRent || 0);
  setMunicipalTax(data.municipalTaxes || 0);
} else {
  setPropertyType("self");
}
    setBorrowedCapitalInterest(data.interest || 0);

    // --- STEP 5: Income from Other Sources ---
    // आपण Gemini ला पाठवलेल्या प्रॉम्प्टनुसार तो हे आकडे देईल
     setOtherBreakup({
  savingsInterest: data.savingsInterest || 0,
  fdInterest: data.fdInterest || 0,
  incomeTaxRefundInterest: data.refundInterest || 0, // <--- इथे 'refundInterest' ऐवजी 'incomeTaxRefundInterest' लिहा
  familyPension: data.familyPension || 0,
  anyOther: 0,
  saleConsideration: 0,
  costAcquisition: 0
});
    setOtherSourcesIncome(data.otherIncome || data.interest || 0);

    // --- STEP 6: Deductions (Chapter VI-A) ---
    setDeduction80C(data.section80c || 0);
    setDeduction80D(data.section80d || 0);
    setDeduction80TTA(data.section80tta || 0);

    alert("✅ AI Auto Fill Complete: सर्व स्टेप्समध्ये डेटा भरला गेला आहे!");
    
    // डेटा भरल्यावर युजरला सॅलरी पेज (Step 2) वर न्या जेणेकरून तो सर्व चेक करत पुढे जाईल
    setStep(2);

  } catch (err) {
    console.error("Upload Error:", err);
    alert("AI प्रोसेस करताना एरर आला.");
  }
};


const handleSubmit = async () => {
  try {
    const { personal, ...filteredData } = itrData;

    const res = await api.post("/submit-itr", filteredData);

    const data = res.data;

    if (res.status === 200 || res.status === 201) {
      setAckNo(data.acknowledgement);   // 👈 ACK store
      setStep(8);                       // 👈 new success step
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error(err);
  }
};

 const downloadPDF = (itrData: any, userData: any, ackNo: string) => {
  const doc = new jsPDF();

  // 🔷 HEADER
  doc.setFontSize(16);
  doc.text("TAX-ASSISTANT INCOME TAX DEPARTMENT", 55, 15);

  doc.setFontSize(11);
  doc.text("Government of India", 75, 22);

  doc.line(10, 25, 200, 25);

  // 🔷 ACK + DATE
  doc.setFontSize(10);
  doc.text(`Acknowledgement No: ${ackNo}`, 10, 35);
  doc.text(`Filed On: ${new Date().toLocaleDateString()}`, 140, 35);

  // 🔷 BASIC DETAILS TABLE
  autoTable(doc, {
    startY: 45,
    head: [["Basic Details", ""]],
    body: [
      ["Assessment Year", itrData.basic?.assessmentYear],
      ["ITR Type", itrData.basic?.itrType],
      ["Filing Type", itrData.basic?.filingType],
    ],
  });


  // 🔷 PERSONAL DETAILS
  autoTable(doc, {
     startY: (doc as any).lastAutoTable.finalY + 5,
    head: [["Personal Details", ""]],
    body: [
      ["Name", userData?.name],
      ["PAN", userData?.pan],
      ["Email", userData?.email],
      ["Mobile", userData?.mobile],
      ["Address", userData?.address],
    ],
  });

  // 🔷 BANK DETAILS
  autoTable(doc, {
     startY: (doc as any).lastAutoTable.finalY + 5,
    head: [["Bank Details", ""]],
    body: [
      ["Account Number", itrData.bank?.account],
      ["IFSC", itrData.bank?.ifsc],
      ["Branch", itrData.bank?.branch],
    ],
  });

  // 🔷 INCOME DETAILS
  autoTable(doc, {
     startY: (doc as any).lastAutoTable.finalY + 5,
    head: [["Income Details", "Amount (₹)"]],
    body: [
      ["Salary", itrData.income?.salary],
      ["Perquisites", itrData.income?.perquisites],
      ["Profits", itrData.income?.profits],
      ["Exemptions", itrData.income?.exemptions?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0],
      ["Total Salary Income", itrData.income?.finalSalaryIncome],
      ["House Property", itrData.house?.incomeFromHouse],
      ["Other Income", itrData.other?.total],
    ],
  });

  // 🔷 DEDUCTIONS
  autoTable(doc, {
     startY: (doc as any).lastAutoTable.finalY + 5,
    head: [["Deductions", "Amount (₹)"]],
    body: [
      ["Section 80C", itrData.deductions?.deduction80C],
      ["Section 80D", itrData.deductions?.deduction80D],
      ["Section 80TTA", itrData.deductions?.deduction80TTA],
    ],
  });

  // 🔷 TAX SUMMARY
  autoTable(doc, {
     startY: (doc as any).lastAutoTable.finalY + 5,
    head: [["Tax Summary", "Amount (₹)"]],
    body: [
      ["Total Income", itrData.tax?.totalIncome],
      ["Taxable Income", itrData.tax?.taxableIncome],
      ["Tax Before Rebate", itrData.tax?.taxBeforeRebate],
      ["Rebate", itrData.tax?.rebate],
      ["Tax After Rebate", itrData.tax?.taxAfterRebate],
      ["Cess", itrData.tax?.cess],
      ["Final Tax", itrData.tax?.finalTax],
    ],
  });

  // 🔷 FOOTER
  doc.setFontSize(9);
  doc.text(
    "This is a system generated Income Tax Return acknowledgement.",
    10,
     (doc as any).lastAutoTable.finalY + 10
  );

  doc.text("Authorized Signatory", 140,  (doc as any).lastAutoTable.finalY + 20);

  // 🔥 DOWNLOAD
  doc.save(`ITR_${ackNo}.pdf`);
};

const [breakupData, setBreakupData] = useState({
  loanTakenFrom: '',
  bankName: '',
  loanAccountNumber: '',
  sanctionDate: '',
  totalLoanAmount: 0,
  outstandingAmount: 0,
  calculatedInterest: 0 // हे आपण युजरने भरलेल्या डेटावरून कॅल्क्युलेट करू
});


// २. 'Other Sources' मधील विविध उत्पन्नांचे स्टेट
const [otherBreakup, setOtherBreakup] = useState({
  savingsInterest: 0,
  fdInterest: 0,
  incomeTaxRefundInterest: 0,
  familyPension: 0,
  anyOther: 0,
  saleConsideration: 0,
  costAcquisition: 0
});



// ३. एकूण बेरीज करून मुख्य पेजवर सेव्ह करण्यासाठी फंक्शन
  const handleSaveOtherIncome = () => {

  const savingsInterest = otherBreakup.savingsInterest || 0;
  const fdInterest = otherBreakup.fdInterest || 0;
  const refundInterest = otherBreakup.incomeTaxRefundInterest || 0;
  const familyPension = otherBreakup.familyPension || 0;
  const otherIncome = otherBreakup.anyOther || 0;

  // ✅ 80TTA
  const savingsDeduction = Math.min(10000, savingsInterest);
  const taxableSavings = savingsInterest - savingsDeduction;

  // ✅ Family pension deduction
  const pensionDeduction = Math.min(Math.round(familyPension / 3), 15000);

  // ✅ FINAL TOTAL (LTCG excluded)
  const total =
    taxableSavings +
    fdInterest +
    refundInterest +
    familyPension +
    otherIncome -
    pensionDeduction;

  setOtherSourcesIncome(total);
  setShowOtherBreakup(false);
};


//  LTCG मोजणे (हाच तो व्हेरिएबल आहे ज्याचा एरर येत होता)
const ltcgAmount = Math.max((otherBreakup.saleConsideration || 0) - (otherBreakup.costAcquisition || 0), 0);

// ४. युजरने ब्रेकअप फॉर्ममध्ये माहिती भरल्यावर ती मुख्य व्हॅल्यूमध्ये सेव्ह करण्यासाठी फंक्शन
 const handleSaveBreakup = () => {
  // युजरने फॉर्ममध्ये भरलेली 'calculatedInterest' ची व्हॅल्यू मुख्य स्टेटमध्ये सेट करा
  setBorrowedCapitalInterest(breakupData.calculatedInterest || 0);
  setShowBreakupForm(false); 
};


  
  // 1. नवीन स्टेप स्टेट (0 = मुख्य फॉर्म, 1 = Personal Info)
  const [step, setStep] = useState(0); 
  const [showModal, setShowModal] = useState<string | null>(null);

  useEffect(() => {
    const startYear = 2015;
    const currentYear = 2025; 
    const yearsList = [];
    for (let i = currentYear; i >= startYear; i--) {
      const yearRange = `${i}-${(i + 1).toString().slice(-2)}`;
      yearsList.push(yearRange);
    }
    setYears(yearsList);
  }, []);

  const handleFilingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilingType(value);
    if (value === '92CD' || value === '139(9A)' || value === '139(1)') {
      setShowModal(value);
    }
  };

  const handleCancel = () => {
    setFilingType(''); 
    setShowModal(null); 
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(0); // पर्सनल इन्फो मधून परत फॉर्मवर येण्यासाठी
    } else {
      navigate('/dashboard'); 
    }
  };

   

  // २. नवीन रो ऍड करण्यासाठी फंक्शन
const addAllowance = () => {
  setExemptAllowances([...exemptAllowances, { id: Date.now(), nature: '', amount: 0 }]);
};

// ३. रो डिलीट करण्यासाठी फंक्शन
const deleteAllowance = (id: number) => {
  setExemptAllowances(exemptAllowances.filter(item => item.id !== id));
};

// १. एकूण सवलतींची (Exemptions) बेरीज करा
 const totalExemptions = exemptAllowances.reduce(
  (sum, item) => sum + (item.amount || 0),
  0
);
// २. Gross Salary काढा (ia + ib + ic)
const grossSalary = salary + perquisites + profits;

// ३. Net Salary (Gross - Exemptions)
 const netSalary = Math.max(0, grossSalary - totalExemptions);

// ४. Standard Deduction (नवीन नियमानुसार ₹ ७५,००० फिक्स)
 const standardDeduction = Math.min(75000, netSalary);


 const grossAnnualValue = grossRent;

const netAnnualValue = Math.max(0, grossAnnualValue - municipalTax);

const standardDeductionHP = netAnnualValue * 0.3;



  const finalInterest =
  borrowedCapitalInterest !== 0 ? borrowedCapitalInterest : interest;

 let incomeFromHouse =
  propertyType === "self"
    ? -Math.min(200000, finalInterest)
    : netAnnualValue - standardDeductionHP - finalInterest;

// 👉 max loss allowed ₹2,00,000
incomeFromHouse = Math.max(incomeFromHouse, -200000);

// ५. फायनल टॅक्सेबल इनकम (Net Salary - Deductions)
const finalSalaryIncome = Math.max(0, netSalary - standardDeduction);

const totalIncome = finalSalaryIncome + incomeFromHouse;



 

// ✅ IMPORTANT ORDER
const grossTotalIncome =
  finalSalaryIncome +
  incomeFromHouse +
  otherSourcesIncome;

  const totalDeductions =
  deduction80C +
  deduction80D +
  deduction80TTA;

  const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
  let remainingIncome = taxableIncome;

let slab1Tax = 0;
let slab2Tax = 0;
let slab3Tax = 0;
let slab4Tax = 0;
let slab5Tax = 0;

// 0 - 3L → 0%
if (remainingIncome > 300000) {
  remainingIncome -= 300000;
} else {
  remainingIncome = 0;
}

// 3L - 6L → 5%
if (remainingIncome > 0) {
  const amount = Math.min(remainingIncome, 300000);
  slab1Tax = amount * 0.05;
  remainingIncome -= amount;
}

// 6L - 9L → 10%
if (remainingIncome > 0) {
  const amount = Math.min(remainingIncome, 300000);
  slab2Tax = amount * 0.1;
  remainingIncome -= amount;
}

// 9L - 12L → 15%
if (remainingIncome > 0) {
  const amount = Math.min(remainingIncome, 300000);
  slab3Tax = amount * 0.15;
  remainingIncome -= amount;
}

// 12L - 15L → 20%
if (remainingIncome > 0) {
  const amount = Math.min(remainingIncome, 300000);
  slab4Tax = amount * 0.2;
  remainingIncome -= amount;
}

// Above 15L → 30%
if (remainingIncome > 0) {
  slab5Tax = remainingIncome * 0.3;
}

 
const taxBeforeRebate =
    slab1Tax +
    slab2Tax +
    slab3Tax +
    slab4Tax +
    slab5Tax;


const rebate = taxableIncome <= 700000 ? taxBeforeRebate : 0;

const taxAfterRebate = taxBeforeRebate - rebate;

const cess = taxAfterRebate * 0.04;

const finalTax = Math.round(taxAfterRebate + cess);

 useEffect(() => {

  // 🔹 Income
  setSalary(voiceData.income.salary || 0);
  setPerquisites(voiceData.income.perquisites || 0);
  setProfits(voiceData.income.profits || 0);

  // 🔹 Deductions
  setDeduction80C(voiceData.deductions.deduction80C || 0);
  setDeduction80D(voiceData.deductions.deduction80D || 0);
  setDeduction80TTA(voiceData.deductions.deduction80TTA || 0);

  // 🔹 House Property
  setPropertyType(voiceData.house.propertyType || "");
  setGrossRent(voiceData.house.grossRent || 0);
  setMunicipalTax(voiceData.house.municipalTax || 0);
  setInterest(voiceData.house.interest || 0);

  // 🔹 Other Income (combined)
  const totalOtherIncome =
    (voiceData.other.savingsInterest || 0) +
    (voiceData.other.fdInterest || 0) +
    (voiceData.other.refundInterest || 0) +
    (voiceData.other.familyPension || 0);

  setOtherSourcesIncome(totalOtherIncome);

  // 🔹 Bank Details
  setBankAccount(voiceData.bank.account || "");
  setIfsc(voiceData.bank.ifsc || "");
  setBranch(voiceData.bank.branch || "");

  // 🔹 Loan
  setBorrowedCapitalInterest(voiceData.loan.borrowedCapitalInterest || 0);
  setOutstandingAmount(voiceData.loan.outstandingAmount || 0);
  setTotalLoanAmount(voiceData.loan.totalLoanAmount || 0);
  setLoanAccountNumber(voiceData.loan.loanAccountNumber || "");

  // 🔹 Capital Gains
  setSaleConsideration(voiceData.capitalGains.saleConsideration || 0);
  setCostAcquisition(voiceData.capitalGains.costAcquisition || 0);

   

}, [voiceData]);

 useEffect(() => {
  const email = localStorage.getItem("email");

  if (!email) {
    console.log("Email not found in localStorage");
    return;
  }

   api.get("/get-user") 
    // 👈 VERY IMPORTANT

    .then(res => {
      const data = res.data;
    
        setUserData({
          name: data.name || "",
          email: data.email || "",
          pan: data.pan || "",
          aadhaar: data.aadhaar || "",
          mobile: data.mobile || "",
          address: data.address || ""
        });
      
    })
    .catch(err => console.error("Fetch error:", err));
}, []);



  return (
    <div className="itr-container">

      
      
      {/* --- स्टेप ०: तुमचा मूळचा संपूर्ण फॉर्म --- */}
      {step === 0 && (
        <>
          <div className="itr-header-section">
            <h2>Income Tax Return (ITR)</h2>
            <p className="mandatory-fields">* Indicates mandatory fields</p>
          </div>

          <div className="itr-card">
            <div className="form-group">
              <label>Select Assessment Year *</label>
              <select value={assessmentYear} onChange={(e) => setAssessmentYear(e.target.value)}>
                <option value="">Select</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {assessmentYear && (
              <>
                <div className="form-group">
                  <label>Select Mode of Filing *</label>
                  <div className="radio-group">
                    <input type="radio" checked={filingMode === 'Online'} onChange={() => setFilingMode('Online')} /> Online
                    <input type="radio" checked={filingMode === 'Offline'} onChange={() => setFilingMode('Offline')} /> Offline
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Filing Type *</label>
                  <select value={filingType} onChange={handleFilingTypeChange}>
                    <option value="">Select</option>
                    <option value="139(1) Original Return">u/s 139(1)  Original Return</option>
                    <option value="92CD Modified Return">u/s 92CD  Modified Return</option>
                    <option value="139(9A) After condonation of delay...">u/s 139(9A)  After condonation of delay...</option>
                    <option value="139(8A) Updated Return">u/s 139(8A)  Updated Return</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Are you audited u/s 44AB or political party...? *</label>
                  <div className="radio-group">
                    <input type="radio" name="audited" checked={isAudited === 'Yes'} onChange={() => setIsAudited('Yes')} /> Yes
                    <input type="radio" name="audited" checked={isAudited === 'No'} onChange={() => setIsAudited('No')} /> No
                  </div>
                </div>

                <div className="form-group">
                  <label>Select ITR Type *</label>
                  <select value={itrType} onChange={(e) => setItrType(e.target.value)}>
                    <option value="">Select</option>
                    <option value="ITR-1">ITR 1</option>
                    <option value="ITR-2">ITR 2</option>
                    <option value="ITR-3">ITR 3</option>
                    <option value="ITR-4">ITR 4</option>
                  </select>
                </div>
              </>
            )}

            <div className="button-group">
              <button className="back-btn" onClick={handleBack}>Back</button>
              <button 
                className="continue-btn" 
                disabled={!itrType || !isAudited} 
                onClick={saveStep0}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- स्टेप १: नवीन PERSONAL INFORMATION PAGE --- */}
       
 {step === 1 && (
  <div className="personal-info-step">
    <div className="itr-header-section">
      <h2>1. Personal Information & Bank Details</h2>
      <p>कृपया तुमची वैयक्तिक आणि बँक खात्याची माहिती तपासा.</p>
    </div>
    
    <div className="itr-card">
      {/* सेक्शन १: वैयक्तिक माहिती */}
      <h3 className="section-title">Personal Details</h3>
      <div className="info-display-grid">
        <div className="info-item">
          <label>Full Name *</label>
           <input type="text" value={userData.name} readOnly />
        </div>
        <div className="info-item">
          <label>PAN Number *</label>
           <input type="text" value={userData.pan} readOnly />
        </div>
        <div className="info-item">
          <label>Aadhaar Number *</label>
           <input type="text" value={userData.aadhaar} readOnly />
        </div>
        <div className="info-item">
          <label>Email Address *</label>
           <input type="email" value={userData.email} readOnly />
        </div>
        <div className="info-item">
          <label>Mobile Number *</label>
           <input type="text" value={userData.mobile} readOnly />
        </div>
        {/* पत्त्यासाठी पूर्ण रुंदीचा कॉलम (Full Width) */}
        <div className="info-item full-width">
          <label>Full Address *</label>
           <textarea value={userData.address} readOnly />
        </div>
      </div>

      <hr className="divider" />

      <h3 className="section-title">Please select the status applicable to you to proceed further</h3>
      <p className="section-subtitle">Based on your last year's data we have pre-selected a status applicable to you. You may change the status if it is not applicable to you.</p>
      
      <div className="status-selection-grid">
        <label className="status-option">
          <input type="radio" name="status" value="Individual" defaultChecked />
          <span className="status-text">Individual</span>
        </label>
        <label className="status-option">
          <input type="radio" name="status" value="HUF" />
          <span className="status-text">HUF</span>
        </label>
        <label className="status-option">
          <input type="radio" name="status" value="Others" />
          <span className="status-text">Others</span>
        </label>
      </div>

      <hr className="divider" />

      <div className="form-section">
        <label className="main-label">Nature of Employment *</label>
        <select className="form-select full-width-select">
          <option value="Others">Others</option>
          <option value="Central Govt">Central Government</option>
          <option value="State Govt">State Government</option>
          <option value="PSU">Public Sector Undertaking</option>
          <option value="Pensioners">Pensioners</option>
        </select>
      </div>

      <hr className="divider" />

      {/* २. Filing Section (इमेजमधील फॉरमॅटप्रमाणे) */}
      <div className="form-section">
        <h3 className="sub-header">Filing Section</h3>
        <div className="filing-grid">
          <div className="filing-row">
            <span className="filing-label">Filed u/s</span>
            <div className="filing-options">
               <label className="radio-label active-radio">
                  <input type="radio" name="sec" defaultChecked /> 
                  <span className="radio-text">139(1) <small>On or before due date</small></span>
               </label>
               <label className="radio-label">
                  <input type="radio" name="sec" /> 
                  <span className="radio-text">139(4) <small>Belated</small></span>
               </label>
               <label className="radio-label">
                  <input type="radio" name="sec" /> 
                  <span className="radio-text">139(5) <small>Revised</small></span>
               </label>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ३. Tax Regime Selection (हुबेहूब फॉरमॅट) */}
      <div className="form-section">
        <p className="regime-question">
          Do you wish to exercise the option u/s 115BAC(6) of Opting out of new tax regime? 
          (default is "No") <strong>Note: For opting out, option should be exercised along with return...</strong>
          <span className="info-icon">ⓘ</span>
        </p>
        
        <div className="regime-flex">
          <label className="regime-choice">
            <input type="radio" name="regime" value="yes" />
            <div className="choice-desc">
              <strong>Yes</strong>
              <p>By selecting this option your income and tax computation shall be as per 'OLD TAX REGIME'</p>
            </div>
          </label>

          <label className="regime-choice">
            <input type="radio" name="regime" value="no" defaultChecked />
            <div className="choice-desc">
              <strong>No</strong>
              <p>By selecting this option your income and tax computation shall be as per 'NEW TAX REGIME'</p>
            </div>
          </label>
        </div>
        <p className="calc-link">To estimate your total tax, you may use <a href="#">Income Tax Calculator</a></p>
      </div>

      <hr className="divider" />

      {/* सेक्शन २: बँक तपशील */}
      <h3 className="section-title">Bank Account Details</h3>
       <div className="info-item">
  <label>Bank Account Number *</label>
  <input
  name="account"
    type="password"
    placeholder="बँक खाते क्रमांक"
    value={bankAccount}
    onChange={(e) => setBankAccount(e.target.value)}
  />
</div>

<div className="info-item">
  <label>Re-type Account Number *</label>
  <input
    name="confirmAccount"
    type="text"
    placeholder="खाते क्रमांकाची पुष्टी करा"
    value={confirmAccount}
    onChange={(e) => setConfirmAccount(e.target.value)}
  />
</div>

<div className="info-item">
  <label>IFSC Code *</label>
  <input
  name ="ifsc"
    type="text"
    placeholder="उदा. SBIN0001234"
    value={ifsc}
    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
  />
</div>

<div className="info-item">
  <label>Branch Name *</label>
  <input
  name="branch"
    type="text"
    placeholder="शाखेचे नाव"
    value={branch}
    onChange={(e) => setBranch(e.target.value)}
  />
</div>
      </div>


<hr className="divider" />

<h3 className="section-title">Upload Documents </h3>

<div className="info-item">
  <label>Select Document Type</label>
  <select onChange={(e) => setSelectedDocType(e.target.value)}>
    <option value="">Select</option>
    <option value="form16">Form 16</option>
    <option value="salary_slip">Salary Slip</option>
    <option value="income_certificate">Income Certificate</option>
    <option value="interest_certificate">Interest Certificate</option>
  </select>
</div>

<div className="info-item">
   <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
          }
        }}
      />
</div>

  <button onClick={handleUpload}>Upload</button>
      <div className="button-group" style={{marginTop: '30px'}}>
        <button className="back-btn" onClick={() => setStep(0)}>Back</button>
         <button onClick={saveStep1}>Confirm & Next</button>
      </div>
    </div>
  
)}

      {/* --- तुमचे जुने सर्व POPUP MODALS (तसेच ठेवले आहेत) --- */}
      {showModal === '139(1)' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>You have selected <b>Original Return u/s 139(1)</b>. Please ensure that you are filing this return on or before the due date for the relevant Assessment Year.</p>
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              {/* पॉपअपमध्ये फक्त 'Continue' दाबल्यावर पॉपअप बंद होईल, पेज बदलणार नाही */}
              <button className="confirm-blue" onClick={() => setShowModal(null)}>Continue</button>
            </div>
          </div>
        </div>
      )}
      
      {/* ... (इतर सर्व ९२CD, १३९(९A), १३९(८A) चे मोडाल्स इथे तसेच राहतील) ... */}
      {showModal === '92CD' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Dear Taxpayer, Modified return u/s 92CD is to be furnished within three months...</p>
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button className="confirm-blue" onClick={() => setShowModal(null)}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {showModal === '139(9A)' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Please ensure that Condonation request is approved before filing the ITR...</p>
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button className="confirm-blue" onClick={() => setShowModal(null)}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {showModal === '139(8A)' && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <h3>Before proceeding to file the updated return, please ensure...</h3>
            <ul className="modal-list">
              <li>Updated return should not be a return of loss.</li>
              <li>Updated return should not have the effect of decreasing the total tax liability...</li>
            </ul>
            <div className="modal-buttons">
               <button onClick={() => setStep(0)}>Back</button>
<button onClick={saveStep1}>Confirm & Next</button>
            </div>
          </div>
        </div>
      )}

{/* ================= STEP 2 INCOME  ================= */}
      {step === 2 && ( 
        <div className="income-step">
      <div className="itr-header-section">
        <h2>B1. Income From Salary</h2>
        <p>Please verify your salary details collected from various sources.</p>
      </div>

      <div className="itr-card">
        {/* ================= GROSS SALARY ================= */}
        <div className="income-sub-section">
          <h3></h3>

          <div className="info-display-grid">
            <div className="info-item">
              <label>Salary u/s 17(1)</label>
              <input
              name="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value) || 0)}
              />
            </div>

            <div className="info-item">
              <label>Perquisites u/s 17(2)</label>
              <input
              name="perquisites"
                type="number"
                value={perquisites}
                onChange={(e) => setPerquisites(Number(e.target.value) || 0)}
              />
            </div>

            <div className="info-item">
              <label>Profits u/s 17(3)</label>
              <input
              name="profits"
                type="number"
                value={profits}
                onChange={(e) => setProfits(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <button
            className="add-another-btn"
            onClick={() => setShowMoreFields(true)}
          >
            + Add Another
          </button>

          {showMoreFields && (
            <div style={{ marginTop: "10px" }}>
              <p>Additional fields (optional)</p>
            </div>
          )}
        </div>

        <hr />

        {/* ================= EXEMPT ALLOWANCES ================= */}
        <div className="income-sub-section">
          <h3>ii. Exempt Allowances u/s 10</h3>

          {exemptAllowances.map((allowance, index) => (
            <div key={allowance.id} className="exempt-row">
              <div className="info-display-grid">
                <div className="info-item">
                  <label>Nature</label>
                   <select
  className="styled-select"
  value={allowance.nature}
  onChange={(e) => {
    const list = [...exemptAllowances];
    list[index].nature = e.target.value;
    setExemptAllowances(list);
  }}
>
  <option value="">-- Select Allowance Type --</option>

  <optgroup label="Common Allowances">
    <option value="10(13A)">
      House Rent Allowance - HRA (Sec 10(13A))
    </option>
    <option value="10(5)">
      Leave Travel Allowance - LTA (Sec 10(5))
    </option>
  </optgroup>

  <optgroup label="Other Exemptions">
    <option value="10(10)">
      Gratuity (Sec 10(10))
    </option>
    <option value="10(14)">
      Special Allowance (Sec 10(14))
    </option>
    <option value="10(14)_transport">
      Transport Allowance
    </option>
    <option value="10(14)_medical">
      Medical Allowance
    </option>
  </optgroup>
</select>
                </div>

                <div className="info-item">
                  <label>Amount</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      name="amount"
                      type="number"
                      value={allowance.amount}
                      onChange={(e) => {
                        const list = [...exemptAllowances];
                        list[index].amount = Number(e.target.value) || 0;
                        setExemptAllowances(list);
                      }}
                    />

                    {exemptAllowances.length > 1 && (
                      <button onClick={() => deleteAllowance(allowance.id)}>
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addAllowance} className="add-another-btn">
            + Add Another
          </button>
        </div>

        <hr />

        {/* ================= SUMMARY ================= */}
        <div className="summary-section">
          <div className="summary-row">
            <span>i. Gross Salary</span>
            <strong>₹ {grossSalary.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-row">
            <span>ii. Exempt Allowances</span>
            <strong style={{ color: "red" }}>
              - ₹ {totalExemptions.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-row">
            <span>iii. Net Salary</span>
            <strong>₹ {netSalary.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-row">
            <span>iv. Standard Deduction</span>
            <strong style={{ color: "red" }}>
              - ₹ {standardDeduction.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="total-income-box">
            <h3> Final Salary Income</h3>
            <span className="final-amount">
              ₹ {finalSalaryIncome.toLocaleString("en-IN")}
            </span>
          </div>
        </div>


        <div className="total-income-box">
  <h3>Taxable Income</h3>
  <span className="final-amount">
    ₹ {taxableIncome.toLocaleString('en-IN')}
  </span>
</div>

        {/* ================= BUTTONS ================= */}
        <div className="button-group">
          <button onClick={() => setStep(1)}>Back</button>
            <button onClick={saveStep2}>Next</button>
        </div>
      </div>
    </div>
  )}

  {step === 3 && (
  <div className="itr-container">
    <div className="itr-header-section">
      <h2>B2. Income from House Property</h2>
      <p>Enter details similar to Income Tax portal</p>
    </div>

    <div className="itr-card">

      {/* Property Type */}
      <div className="info-item">
        <label>Type of House Property</label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">Select</option>
          <option value="self">Self Occupied</option>
          <option value="letout">Let Out</option>
        </select>
      </div>

      {/* Let Out Fields */}
      {propertyType === "letout" && (
        <>
          <div className="info-item">
            <label>Gross Rent Received / Receivable</label>
            <input
              name="grossRent"
              type="number"
              value={grossRent}
              onChange={(e) => setGrossRent(Number(e.target.value) || 0)}
            />
          </div>

          <div className="info-item">
            <label>Municipal Taxes Paid</label>
            <input
              name="municipalTax"
              type="number"
              value={municipalTax}
              onChange={(e) => setMunicipalTax(Number(e.target.value) || 0)}
            />
          </div>
        </>
      )}

      {/* Common */}
      <div className="info-item">
        <label>Interest on Housing Loan</label>
        <input
          name="interest"
          type="number"
          value={interest}
          onChange={(e) => setInterest(Number(e.target.value) || 0)}
        />
      </div>

      {/* ================= CALCULATION ================= */}

      <div className="summary-section">

        <div className="summary-row">
          <span>Gross Annual Value</span>
          <strong>₹ {grossRent.toLocaleString('en-IN')}</strong>
        </div>

        <div className="summary-row">
          <span>Less: Municipal Taxes</span>
          <strong style={{color:'red'}}>
             ₹ {municipalTax.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="summary-row">
          <span>Net Annual Value</span>
          <strong>
             ₹ {netAnnualValue.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="summary-row">
          <span>Standard Deduction (30%)</span>
          <strong style={{color:'red'}}>
             ₹ {standardDeductionHP.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="summary-row">
          <span>Interest on Loan</span>
          <strong style={{color:'red'}}>
            ₹ {interest.toLocaleString('en-IN')}
          </strong>
        </div>

         <div className="total-income-box">
  <h3>Income from House Property</h3>
  <span className="final-amount">
    ₹ {incomeFromHouse.toLocaleString('en-IN')}
  </span>

        </div>

      </div>

      {/* ================= TOTAL COMBINED ================= */}

      <div className="total-income-box" style={{marginTop:'20px'}}>
        <h3>Total Income (Salary + House Property)</h3>
         <span className="final-amount">
   ₹ {totalIncome.toLocaleString('en-IN')}
</span>
      </div>

      {/* ================= BUTTONS ================= */}

      <div className="button-group">
        <button onClick={() => setStep(2)}>Back</button>

         <button onClick={saveStep3}>Next</button>
      </div>

    </div>
  </div>
)}

{step === 4 && (
  <div className="itr-step-container">
    <div className="itr-header-section">
      <h2>Section 24(b) - Interest on borrowed capital</h2>
      <p className="verify-msg">Please provide details of interest paid on loan taken for house property.</p>
    </div>

    <div className="itr-card">
      
      {/* --- i. मुख्य सेक्शन (पहिला फोटो - image_17.png) --- */}
      <div className="section-header-row">
        <span>Section 24(b) - Interest on borrowed capital</span>
        <span className="calculated-total">₹ {borrowedCapitalInterest.toLocaleString('en-IN')}</span>
      </div>

      <div className="info-display-box" style={{border: '1px solid #ddd', padding: '15px', marginTop: '10px'}}>
        <p className="regime-question">
          Do you want to add more breakup values? <span className="info-icon">ⓘ</span>
        </p>
        
        {/* '+ Add Another' বাটन - यावर क्लिक केल्यावर फॉर्म उघडेल */}
        {!showBreakupForm && (
          <button type="button" className="add-another-btn" onClick={() => setShowBreakupForm(true)}>
            + Add Another
          </button>
        )}

        {/* --- ii. ब्रेकअप फॉर्म (दुसरा फोटो - image_18.png) --- */}
        {showBreakupForm && (
          <div className="breakup-form-portal" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #ccc'}}>
             <div className="info-display-grid">
                <div className="info-item">
                   <label>i. Loan taken from *</label>
                   <select 
                      value={breakupData.loanTakenFrom}
                      onChange={(e) => setBreakupData({...breakupData, loanTakenFrom: e.target.value})}
                   >
                      <option value="">Select</option>
                      <option value="Bank">Bank/Financial Institution</option>
                      <option value="Employer">Employer</option>
                      <option value="Others">Others</option>
                   </select>
                </div>
                <div className="info-item">
                   <label>ii. Name of the bank/Institution/Person... *</label>
                   <input 
                        name="bankName"
                      type="text" 
                      placeholder="Enter Name"
                      value={breakupData.bankName}
                      onChange={(e) => setBreakupData({...breakupData, bankName: e.target.value})}
                   />
                </div>
                <div className="info-item">
                   <label>iii. Loan Account number of the Bank/Institution *</label>
                   <input 
                        name="loanAccountNumber"
                      type="text" 
                      placeholder="Loan Account No."
                      value={breakupData.loanAccountNumber}
                      onChange={(e) => setBreakupData({...breakupData, loanAccountNumber: e.target.value})}
                   />
                </div>
                <div className="info-item">
                   <label>iv. Date of sanction of loan *</label>
                   <input 
                      type="date" 
                      value={breakupData.sanctionDate}
                      onChange={(e) => setBreakupData({...breakupData, sanctionDate: e.target.value})}
                   />
                </div>
                <div className="info-item">
                   <label>v. Total amount of loan *</label>
                   <input 
                        name="totalLoanAmount"
                      type="number" 
                      placeholder="₹ 0"
                      value={breakupData.totalLoanAmount || ''}
                      onChange={(e) => setBreakupData({...breakupData, totalLoanAmount: Number(e.target.value)})}
                   />
                </div>
                <div className="info-item">
                   <label>vi. Loan outstanding as on last date of financial year *</label>
                   <input 
                      name="outstandingAmount"
                      type="number" 
                      placeholder="₹ 0"
                      value={breakupData.outstandingAmount || ''}
                      onChange={(e) => setBreakupData({...breakupData, outstandingAmount: Number(e.target.value)})}
                   />
                </div>
                {/* Interest field जो मुख्य अमाऊंट मध्ये ऍड होईल */}
                <div className="info-item full-width" style={{background: '#f8f9fa', padding: '10px', borderRadius: '4px'}}>
                   <label>vii. Interest on Borrowed capital u/s 24(b) *</label>
                   <input 
                      name="borrowedCapitalInterest"
                      type="number" 
                      placeholder="₹ 0"
                      style={{fontWeight: 'bold', fontSize: '1.1rem'}}
                      value={breakupData.calculatedInterest || ''}
                      onChange={(e) => setBreakupData({...breakupData, calculatedInterest: Number(e.target.value)})}
                   />
                </div>
             </div>
             <div className="modal-buttons" style={{justifyContent: 'flex-start', marginTop: '15px'}}>
                 <button type="button" onClick={() => setShowBreakupForm(false)}>Cancel</button>
                 <button type="button" className="confirm-blue" onClick={handleSaveBreakup}>Save Breakup</button>
             </div>
          </div>
        )}
      </div>

      <div className="summary-line mt-4" style={{borderTop: '1px solid #ddd', paddingTop: '15px'}}>
        <span>Total of Interest on Borrowed capital u/s 24(b)</span>
        <strong style={{fontSize: '1.2rem', color: '#1a3a5f'}}>₹ {borrowedCapitalInterest.toLocaleString('en-IN')}</strong>
      </div>


<div className="total-income-box" style={{marginTop:'20px'}}>
  <h3>Taxable Income</h3>
  <span className="final-amount">
    ₹ {taxableIncome.toLocaleString('en-IN')}
  </span>
</div>
      <div className="button-group" style={{marginTop: '30px'}}>
        <button className="back-btn" onClick={() => setStep(3)}>Back</button>
        {/* 'Confirm & Next' बटण दाबल्यावर हा डेटा स्टोअर होऊन पुढील स्टेप सुरु होईल */}
        <button className="continue-btn" onClick={ saveStep4}>Confirm & Next</button>
      </div>
    </div>
  </div>
)}


 {step === 5 && (
  <div className="itr-step-container">
    <div className="itr-header-section">
      <h2>B4. Income from Other Sources</h2>
      <p className="verify-msg">Please provide details of income from other sources like interest, pension etc.</p>
    </div>

    <div className="itr-card">
      {/* --- i. Income from Other Sources Summary --- */}
      <div className="section-header-row">
        <span>Income from Other Sources</span>
        <span className="calculated-total">₹ {otherSourcesIncome.toLocaleString('en-IN')}</span>
      </div>

      <div className="info-display-box">
        <p className="regime-question">Do you have any income from Other Sources? (Add breakup values)</p>
        
        {!showOtherBreakup && (
          <button type="button" className="add-another-btn" onClick={() => setShowOtherBreakup(true)}>
            + Add Another / Add Breakup
          </button>
        )}

        {showOtherBreakup && (
          <div className="breakup-form-portal mt-4">
            <div className="info-display-grid">
              <div className="info-item">
                <label>1. Interest from Savings Bank Account *</label>
                <input 
                name="savingsInterest"
                type="number" value={otherBreakup.savingsInterest || ''} onChange={(e) => setOtherBreakup({...otherBreakup, savingsInterest: Number(e.target.value)})} />
              </div>

              <p style={{fontSize:'12px', color:'#777'}}>
  Savings interest eligible for deduction u/s 80TTA (max ₹10,000)
</p>

              <div className="info-item">
                <label>2. Interest from Deposits (Bank/Post Office) *</label>
                <input 
                name="fdInterest"
                type="number" value={otherBreakup.fdInterest || ''} onChange={(e) => setOtherBreakup({...otherBreakup, fdInterest: Number(e.target.value)})} />
              </div>

              <div className="info-item">
                <label>3. Interest on Income Tax Refund *</label>
                <input 
                name="incomeTaxRefundInterest"
                type="number" value={otherBreakup.incomeTaxRefundInterest || ''} onChange={(e) => setOtherBreakup({...otherBreakup, incomeTaxRefundInterest: Number(e.target.value)})} />
              </div>

              <div className="info-item">
                <label>4. Family Pension *</label>
                <input 
                name="familyPension"
                type="number" value={otherBreakup.familyPension || ''} onChange={(e) => setOtherBreakup({...otherBreakup, familyPension: Number(e.target.value)})} />
              </div>
            </div>

            {/* --- Long Term Capital Gains u/s 112A (नवीन विभाग) --- */}
            <div className="ltcg-section-portal mt-4">
              <h4 className="sub-section-title">Income on which no tax is payable : Long Term capital gains u/s 112A</h4>
              <div className="info-display-grid mt-2">
                <div className="info-item">
                  <label>i. Total sale consideration *</label>
                  <input
                  name="saleConsideration"
                  type="number" value={otherBreakup.saleConsideration || ''} onChange={(e) => setOtherBreakup({...otherBreakup, saleConsideration: Number(e.target.value)})} />
                </div>
                <div className="info-item">
                  <label>ii. Total cost of acquisition *</label>
                  <input 
                  name="costAcquisition"
                  type="number" value={otherBreakup.costAcquisition || ''} onChange={(e) => setOtherBreakup({...otherBreakup, costAcquisition: Number(e.target.value)})} />
                </div>
              </div>
              <div className="summary-line highlighted-text mt-2">
                <span>iii. Long term capital gains as per sec 112A</span>
                <span>₹ {ltcgAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="modal-buttons mt-4">
                <button type="button" className="confirm-blue" onClick={handleSaveOtherIncome}>Save Breakup</button>
            </div>
          </div>
        )}
      </div>

      {/* --- ii. Deduction u/s 57(iia) --- */}
      <div className="deduction-section-other mt-4">
        <div className="summary-line">
          <span>Less: Deduction u/s 57(iia) (in case of family pension income)</span>
          <span className="deduction-amount" style={{color: 'red'}}>- ₹ {Math.min(Math.round(otherBreakup.familyPension / 3), 15000).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="final-income-highlight-box mt-4">
        <span>Total Income from Other Sources</span>
        <span className="final-amount">₹ {otherSourcesIncome.toLocaleString('en-IN')}</span>
      </div>

      {/* --- B5. Gross Total Income (Final Summary Box) --- */}
      <div className="gti-container mt-5">
        <div className="gti-box">
          <span className="gti-label">B5. Gross Total Income (B1+B2+B3+B4)</span>
          <span className="gti-amount">
            ₹ {(finalSalaryIncome + otherSourcesIncome).toLocaleString('en-IN')}
            
          </span>
        </div>
      </div>

      <div className="button-group mt-4">
        <button className="back-btn" onClick={() => setStep(4)}>Back</button>
         <button onClick={saveStep5}>Next</button>
      </div>
    </div>
  </div>
)}

 {step === 6 && (
  <div className="itr-container">
    <div className="itr-header-section">
      <h2>Final Tax Calculation</h2>
      <p>Review your final tax liability</p>
    </div>

    {/* ✅ DEDUCTIONS (UNCHANGED) */}
    <div className="deduction-container">

      <h3 className="section-title">Chapter VI-A Deductions</h3>

      <div className="deduction-card">

        <div className="deduction-item">
          <label>Section 80C (Investments)</label>
          <input
            name="deduction80C"
            type="number"
            placeholder="Max ₹1,50,000"
            value={deduction80C}
            onChange={(e) => setDeduction80C(Number(e.target.value) || 0)}
          />
        </div>

        <div className="deduction-item">
          <label>Section 80D (Medical Insurance)</label>
          <input
              name="deduction80D"
            type="number"
            placeholder="Max ₹25,000"
            value={deduction80D}
            onChange={(e) => setDeduction80D(Number(e.target.value) || 0)}
          />
        </div>

        <div className="deduction-item">
          <label>Section 80TTA (Savings Interest)</label>
          <input
              name="deduction80TTA"
            type="number"
            placeholder="Max ₹10,000"
            value={deduction80TTA}
            onChange={(e) => setDeduction80TTA(Number(e.target.value) || 0)}
          />
        </div>

      </div>

      <div className="deduction-total">
        <span>Total Deductions</span>
        <strong>
          ₹ {(Math.min(deduction80C,150000) + 
              Math.min(deduction80D,25000) + 
              Math.min(deduction80TTA,10000)
            ).toLocaleString('en-IN')}
        </strong>
      </div>
    </div>

    {/* 🔥 NEW PROFESSIONAL TAX UI */}
    <div className="tax-summary-card">

      <h2>Tax Calculation Summary</h2>

      <div className="summary-row">
        <span>Total Income</span>
        <strong>₹ {totalIncome.toLocaleString('en-IN')}</strong>
      </div>

      <div className="summary-row">
        <span>Total Deductions</span>
        
          - ₹ {(Math.min(deduction80C,150000) + 
                Math.min(deduction80D,25000) + 
                Math.min(deduction80TTA,10000)
              ).toLocaleString('en-IN')}
  
      </div>

      <div className="summary-row highlight">
        <span>Taxable Income</span>
        <strong>₹ {taxableIncome.toLocaleString('en-IN')}</strong>
      </div>

      {/* 🔥 SLAB BREAKDOWN */}
      <div className="tax-slab-table">
        <h3>Tax Slab Breakdown</h3>

        <div className="table-row header">
          <span>Income Range</span>
          <span>Rate</span>
          <span>Tax</span>
        </div>

        <div className="table-row">
          <span>0 - 3,00,000</span>
          <span>0%</span>
          <span>₹ 0</span>
        </div>

        <div className="table-row">
          <span>3L - 6L</span>
           <span>  5% </span>
          <span>₹ {slab1Tax}</span>
        </div>

        <div className="table-row">
          <span>6L - 9L</span>
          <span>10%</span>
          <span>₹ {slab2Tax}</span>
        </div>

        <div className="table-row">
          <span>9L - 12L</span>
          <span>15%</span>
          <span>₹ {slab3Tax}</span>
        </div>

        <div className="table-row">
          <span>12L - 15L</span>
          <span>20%</span>
          <span>₹ {slab4Tax}</span>
        </div>

        <div className="table-row">
          <span>Above 15L</span>
          <span>30%</span>
          <span>₹ {slab5Tax}</span>
        </div>
      </div>

      {/* 🔥 FINAL TAX */}
       <div className="final-tax-box">

  <div className="summary-row">
    <span>Tax Before Rebate</span>
    <strong>₹ {taxBeforeRebate.toLocaleString('en-IN')}</strong>
  </div>

  <div className="summary-row">
    <span>Rebate u/s 87A</span>
    <strong>
      - ₹ {rebate.toLocaleString('en-IN')}
    </strong>
  </div>

  <div className="summary-row">
    <span>Tax After Rebate</span>
    <strong>₹ {taxAfterRebate.toLocaleString('en-IN')}</strong>
  </div>

  <div className="summary-row">
    <span>Health & Education Cess (4%)</span>
    <strong>₹ {cess.toLocaleString('en-IN')}</strong>
  </div>

  <div className="final-amount">
    Final Tax Payable: ₹ {finalTax.toLocaleString('en-IN')}
  </div>

</div>

      <div className="button-group">
        <button className="back-btn" onClick={() => setStep(5)}>Back</button>
          <button onClick={saveStep6}>Preview</button>
      </div>

    </div>
  </div>
)}


 {step === 7 && (

  
  <div className="preview-container">

     <div className="gov-header">
  <h2>TAX-ASSISTANT INCOME TAX DEPARTMENT</h2>
  <p>Government of India</p>
  <p>www.tax-assistant.gov.in</p>
  
  <hr />

  <h3>Income Tax Return Acknowledgement</h3>
  <p>
    Assessment Year: <b>{itrData.basic?.assessmentYear}</b>
  </p>
</div>

    <div className="itr-card">

      {/* 🔹 BASIC */}
      <h3>Basic Details</h3>
      <p>Assessment Year: {itrData.basic?.assessmentYear}</p>
      <p>Filing Type: {itrData.basic?.filingType}</p>
      <p>ITR Type: {itrData.basic?.itrType}</p>

      {/* 🔹 PERSONAL */}
      <h3 className="section-title">Personal Information</h3>
      <div className="preview-grid">
         <div><b>Name:</b> {userData.name}</div>
        <div><b>PAN:</b>  {userData.pan}</div>
        <div><b>Email:</b>  {userData.email}</div>
        <div><b>Aadhaar:</b>  {userData.aadhaar}</div>
        <div><b>Mobile:</b>  {userData.mobile}</div>
        <div><b>Address:</b>  {userData.address}</div>
      </div>

      {/* 🔹 BANK */}
      <h3 className="section-title">Bank Details</h3>
      <div className="preview-grid">
        <div><b>Account No:</b> {itrData.bank?.account}</div>
        <div><b>IFSC:</b> {itrData.bank?.ifsc}</div>
        <div><b>Branch:</b> {itrData.bank?.branch}</div>
      </div>

      {/* 🔹 INCOME */}
      <h3 className="section-title">Income Details</h3>
      <div className="preview-grid">
        <div>Salary: ₹ {itrData.income?.salary}</div>
        <div>Perquisites: ₹ {itrData.income?.perquisites}</div>
        <div>Profits: ₹ {itrData.income?.profits}</div>
        <div>
          Exempt Allowances: ₹ {
            Array.isArray(itrData.income?.exemptions)
              ? itrData.income.exemptions.reduce((sum, e) => sum + (e.amount || 0), 0)
              : 0
          }
        </div>
        <div><b>Total Salary Income:</b> ₹ {itrData.income?.finalSalaryIncome}</div>
      </div>

      {/* 🔹 HOUSE PROPERTY */}
      <h3 className="section-title">House Property</h3>
      <div className="preview-grid">
        <div>Property Type: {itrData.house?.propertyType}</div>
        <div>Gross Rent: ₹ {itrData.house?.grossRent}</div>
        <div>Municipal Tax: ₹ {itrData.house?.municipalTax}</div>
        <div>Interest: ₹ {itrData.house?.interest}</div>
        <div><b>Income from House:</b> ₹ {itrData.house?.incomeFromHouse}</div>
      </div>

      {/* 🔹 OTHER INCOME */}
      <h3 className="section-title">Other Income</h3>
      <div className="preview-grid">
        <div>Savings Interest: ₹ {itrData.other?.savingsInterest}</div>
        <div>FD Interest: ₹ {itrData.other?.fdInterest}</div>
        <div>IT Refund Interest: ₹ {itrData.other?.incomeTaxRefundInterest}</div>
        <div>Family Pension: ₹ {itrData.other?.familyPension}</div>
        <div><b>Total Other Income:</b> ₹ {itrData.other?.total}</div>
      </div>

      {/* 🔹 DEDUCTIONS */}
      <h3 className="section-title">Deductions</h3>
      <div className="preview-grid">
        <div>80C: ₹ {itrData.deductions?.deduction80C}</div>
        <div>80D: ₹ {itrData.deductions?.deduction80D}</div>
        <div>80TTA: ₹ {itrData.deductions?.deduction80TTA}</div>
      </div>

      {/* 🔹 TAX */}
      <h3 className="section-title">Tax Summary</h3>
      <div className="preview-grid">
        <div>Total Income: ₹ {itrData.tax?.totalIncome}</div>
        <div>Taxable Income: ₹ {itrData.tax?.taxableIncome}</div>
        <div>Tax Before Rebate: ₹ {itrData.tax?.taxBeforeRebate}</div>
        <div>Rebate: ₹ {itrData.tax?.rebate}</div>
        <div>Tax After Rebate: ₹ {itrData.tax?.taxAfterRebate}</div>
        <div>Cess: ₹ {itrData.tax?.cess}</div>
        <div><b>Final Tax: ₹ {itrData.tax?.finalTax}</b></div>
      </div>

      {/* 🔹 BUTTONS */}
      <div className="button-group">
        <button onClick={() => setStep(6)}>Back</button>
        <button onClick={handleSubmit}>Submit ITR</button>
      </div>

    </div>
  </div>
)}

{step === 8 && (
  <div className="success-container">

    <div className="success-card">
      <h2>✅ ITR Submitted Successfully</h2>

      <p>Your Income Tax Return has been filed successfully.</p>

      <h3>
        Acknowledgement Number: 
        <span style={{color: "green"}}> {ackNo} </span>
      </h3>

      <p>Please save this number for future reference.</p>
      <button onClick={() => downloadPDF(itrData, userData, ackNo)}>
    Download Acknowledgement
  </button>

      <button onClick={() => setStep(0)}>
        Go to Dashboard
      </button>
    </div>

  </div>
)}

    </div>
  );
};

export default FileITR;