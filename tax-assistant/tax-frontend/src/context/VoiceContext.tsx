  import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react"


// १. सर्व डेटा टाइप्सचे इंटरफेस डिफाइन करूया (तुझ्या कोडनुसार)
interface VoiceDataState {
  personal: {
    name: string; email: string; pan: string; aadhaar: string; mobile: string; address: string;
  };
  bank: {
    account: string; ifsc: string; branch: string; bankName: string;
  };
  income: {
    salary: number; perquisites: number; profits: number; grossSalary: number;
  };
  house: {
    propertyType: string; grossRent: number; municipalTax: number; interest: number;
  };
  other: {
    savingsInterest: number; fdInterest: number; refundInterest: number; familyPension: number;
  };
  deductions: {
    deduction80C: number; deduction80D: number; deduction80TTA: number;
  };
  capitalGains: {
    saleConsideration: number;
    costAcquisition: number;
  };

  loan: {
    borrowedCapitalInterest: number;
    outstandingAmount: number;
    totalLoanAmount: number;
    loanAccountNumber: string;
  };

  tax: {
    basicTax: number;
    surcharge: number;
    cess: number;
    interest: number;
    penalty: number;
    others: number;
  };
}

const initialState: VoiceDataState = {
  personal: { name: "", email: "", pan: "", aadhaar: "", mobile: "", address: "" },
  bank: { account: "", ifsc: "", branch: "", bankName: "" },
  income: { salary: 0, perquisites: 0, profits: 0, grossSalary: 0 },
  house: { propertyType: "Self Occupied", grossRent: 0, municipalTax: 0, interest: 0 },
  other: { savingsInterest: 0, fdInterest: 0, refundInterest: 0, familyPension: 0 },
  deductions: { deduction80C: 0, deduction80D: 0, deduction80TTA: 0 },
  capitalGains: { saleConsideration: 0, costAcquisition: 0 },
  loan: { borrowedCapitalInterest: 0, outstandingAmount: 0, totalLoanAmount: 0, loanAccountNumber: "" },
  tax: { basicTax: 0, surcharge: 0, cess: 0, interest: 0, penalty: 0, others: 0 }
};

const VoiceContext = createContext<any>(null);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [voiceData, setVoiceData] = useState<VoiceDataState>(initialState);

  // डेटा अपडेट करण्यासाठी एक सोपे फंक्शन (उदा. setVoiceField('income', 'salary', 50000))
  const setVoiceField = (category: keyof VoiceDataState, field: string, value: any) => {
    setVoiceData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <VoiceContext.Provider value={{ voiceData, setVoiceData, setVoiceField }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);