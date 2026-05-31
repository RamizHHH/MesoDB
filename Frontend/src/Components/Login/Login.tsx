import "./Login.css";
import { useState } from "react";

function Login() {
  const API = import.meta.env.VITE_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  type GoogleSignupResponse = {
    url?: string;
    message?: string;
  };

  async function handleGoogleSignup() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await fetch(`${API}/Signup_Google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl: window.location.origin }),
      });

      const data: GoogleSignupResponse = await result.json();

      if (!result.ok || !data.url) {
        setIsSuccess(false);
        setMessage(data.message ?? "Could not start Google signup.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error during Google signup:", error);
      setIsSuccess(false);
      setMessage("Could not start Google signup. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signup-screen">
      <h2 id="signup_h2">Login</h2>
      <p id="signup_p">Use Google to access AI chat and other features.</p>
      <div className="signup-form">
        <button
          type="button"
          className="google_signup_button"
          onClick={handleGoogleSignup}
          disabled={isSubmitting}
        >
          <span className="google_icon">G</span>
          {isSubmitting ? "Opening Google..." : "Continue with Google"}
        </button>
      </div>
      {message && (
        <p
          id="signup_status_p"
          className={
            isSuccess ? "signup_status_success" : "signup_status_error"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;
