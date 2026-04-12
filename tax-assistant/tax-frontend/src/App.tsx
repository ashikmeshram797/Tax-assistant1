import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ChatPage from "./pages/ChatPage";
import UserView from "./pages/UserView";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/Layout/Layout";
import TaxCalculator from "./pages/TaxCalculator";
import GuidancePage from "./pages/GuidancePage";
import TaxApplicability from "./pages/TaxApplicability";
import TaxSlabDeduction from "./pages/TaxSlabDeduction";
import UpdateProfile from "./pages/UpdateProfile";
import AssistedFiling from "./pages/AssistedFiling";
import DownloadDocs from "./pages/DownloadDocs";
import FileITR from "./pages/FileITR";
import Dashboard from "./pages/Dashboard";
import EPayTax from "./pages/EPayTax";
import ITRHistory from "./pages/ITRHistory"
import VoiceAssistant from "./components/VoiceAssistant";
import { VoiceProvider } from "./context/VoiceContext";

 function App() {
  return (
    <VoiceProvider>   {/* 🔥 ADD THIS */}
      <BrowserRouter>
        <VoiceAssistant/>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/users" element={<UserView />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/tax-calculator" element={<TaxCalculator />} />
              <Route path="/guidance" element={<GuidancePage />} />
              <Route path="/return-form-info" element={<TaxApplicability />} />
              <Route path="/tax-slab-deduction" element={<TaxSlabDeduction />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/assisted-filing" element={<AssistedFiling />} />
              <Route path="/download-docs" element={<DownloadDocs />} />
              <Route path="/file-return" element={<FileITR />} />  
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/e-pay-tax" element={<EPayTax />} />
              <Route path="/itr-history" element={<ITRHistory />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </VoiceProvider>  
  );
}


export default App;