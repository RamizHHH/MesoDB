import { useEffect, useState } from "react";
import { clearAuth, getAuthHeaders, type AuthProfile } from "../../Auth/Auth";
import "./Profile.css";

function Profile() {
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/Profile`, {
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.profile) {
          setMessage(data.message ?? "Log in with Google to view your profile.");
          return;
        }

        setProfile(data.profile);
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
        setMessage("Could not load profile. Try again later.");
      });
  }, [API]);

  function handleLogout() {
    clearAuth();
    window.location.href = "/";
  }

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <h2 id="profile_h2">Profile</h2>
        <p id="profile_intro_p">Your MesoDB account and daily AI usage.</p>
      </div>
      {profile ? (
        <>
          <div className="profile-info">
            <div className="profile-info-card">
              <span>Name</span>
              <p>{profile.name ?? "Google user"}</p>
            </div>
            <div className="profile-info-card">
              <span>Email</span>
              <p>{profile.email ?? "Unavailable"}</p>
            </div>
            <div className="profile-info-card">
              <span>AI uses today</span>
              <p>
                {profile.ai_used_today ?? 0} / {profile.ai_limit ?? 10}
              </p>
            </div>
            <div className="profile-info-card">
              <span>Remaining today</span>
              <p>{profile.ai_remaining_today ?? 10}</p>
            </div>
          </div>
          <button id="profile_logout_button" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <p id="profile_status_p">{message}</p>
      )}
    </div>
  );
}

export default Profile;
