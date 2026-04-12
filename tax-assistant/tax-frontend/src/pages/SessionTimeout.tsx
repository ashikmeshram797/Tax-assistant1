import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionTimeout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const INITIAL_TIME = 900; // १५ मिनिटे = ९०० सेकंद
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const timerRef = useRef<any>(null);

  const logoutUser = () => {
    localStorage.removeItem("isAuth");
    alert("तुमचे सेशन संपले आहे.");
    navigate("/");
  };

  // टाइमर सुरू/रिसेट करण्यासाठी
  useEffect(() => {
    setTimeLeft(INITIAL_TIME); // पेज बदलले की वेळ पुन्हा ९०० वर येते
    
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          logoutUser();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location]);

  // सेकंदांना MM:SS फॉरमॅटमध्ये बदलण्यासाठी
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="session-timer">
      ⏱ Session: <span className="timer-count">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default SessionTimeout;