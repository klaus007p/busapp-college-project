import React, { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { FaArrowLeft, FaArrowRight, FaEnvelope, FaSignOutAlt, FaUser } from "react-icons/fa";
import "./profile.css";

function Profile({ history }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
            history.replace("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded.user);
        } catch {
            sessionStorage.removeItem("authToken");
            history.replace("/login");
        }
    }, [history]);

    const signOut = () => {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("bookingData");
        history.push("/");
    };

    if (!user) {
        return <div className="profile-loading" role="status">Loading your profile...</div>;
    }

    return (
        <main className="profile-page">
            <header className="profile-header">
                <button className="booking-brand" type="button" onClick={() => history.push("/routes")}>
                    <span><FaUser aria-hidden="true" /></span>
                    wayfare<span className="brand-period">.</span>
                </button>
                <button className="booking-signout" type="button" onClick={signOut}>
                    <FaSignOutAlt aria-hidden="true" /> Sign out
                </button>
            </header>

            <section className="profile-content">
                <button className="profile-back" type="button" onClick={() => history.push("/routes")}>
                    <FaArrowLeft aria-hidden="true" /> Back to your trip
                </button>
                <div className="profile-card">
                    <div className="profile-cover">
                        <span className="profile-avatar">{(user.name || user.email || "W").charAt(0).toUpperCase()}</span>
                        <p>YOUR WAYFARE ACCOUNT</p>
                    </div>
                    <div className="profile-info">
                        <h1>{user.name || "Traveler"}</h1>
                        <p>Ready when you are. Your next journey is just around the corner.</p>
                        <div className="profile-detail">
                            <span><FaEnvelope aria-hidden="true" /></span>
                            <div><small>EMAIL ADDRESS</small><strong>{user.email}</strong></div>
                        </div>
                        {user.gender && (
                            <div className="profile-detail">
                                <span><FaUser aria-hidden="true" /></span>
                                <div><small>GENDER</small><strong>{user.gender}</strong></div>
                            </div>
                        )}
                        <button className="booking-primary profile-book" type="button" onClick={() => history.push("/routes")}>
                            Find your next bus <FaArrowRight aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Profile;
