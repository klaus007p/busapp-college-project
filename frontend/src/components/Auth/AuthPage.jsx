import React, { useState } from "react";
import { FaArrowRight, FaBus, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaRoute, FaShieldAlt, FaUser } from "react-icons/fa";
import { logUserIn } from "../Login-Signup/loginFunctions";
import { registerUser } from "../Login-Signup/SignupFunctions";
import "./auth.css";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  gender: "",
  password: "",
  confirmPassword: ""
};

function AuthPage({ history, location }) {
  const isRegister = location.pathname === "/register";
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setNotice("");
  };

  const changeMode = (register) => {
    setError("");
    setNotice("");
    history.push(register ? "/register" : "/login");
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);
    let navigatedAway = false;

    try {
      if (isRegister) {
        if (form.password !== form.confirmPassword) {
          setError("Your passwords do not match.");
          return;
        }

        await registerUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile.trim(),
          gender: form.gender,
          password: form.password
        });
        setForm((currentForm) => ({ ...initialForm, email: currentForm.email }));
        setNotice("Your account is ready. Sign in to plan your next trip.");
        history.push("/login");
        return;
      }

      const response = await logUserIn({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      sessionStorage.setItem("authToken", response.data.token);
      navigatedAway = true;
      history.push("/routes");
    } catch (requestError) {
      setError(
        requestError.response && requestError.response.data && requestError.response.data.message
          ? requestError.response.data.message
          : "We could not complete that request. Check your connection and try again."
      );
    } finally {
      if (!navigatedAway) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <header className="site-header">
        <button className="brand" type="button" onClick={() => history.push("/")}>
          <span className="brand-icon"><FaBus aria-hidden="true" /></span>
          <span>wayfare<span className="brand-period">.</span></span>
        </button>
        <nav className="header-actions" aria-label="Account">
          <span className="header-prompt">Your next trip starts here</span>
          <button
            className={`header-link${isRegister ? "" : " is-active"}`}
            type="button"
            onClick={() => changeMode(false)}
          >
            Sign in
          </button>
          <button
            className={`header-cta${isRegister ? " is-active" : ""}`}
            type="button"
            onClick={() => changeMode(true)}
          >
            Create account
          </button>
        </nav>
      </header>

      <main className="auth-main">
        <section className="travel-story" aria-label="Travel with Wayfare">
          <div className="story-orbit orbit-one" />
          <div className="story-orbit orbit-two" />
          <div className="story-content">
            <p className="eyebrow"><span /> THE JOURNEY, MADE BETTER</p>
            <h1>A little closer<br />to <em>everywhere.</em></h1>
            <p className="story-description">
              Find your route, choose your seat, and leave the rest to us.
              Your next great trip is just a few clicks away.
            </p>
            <div className="journey-card">
              <div className="journey-card-top">
                <span><FaRoute aria-hidden="true" /> YOUR NEXT ADVENTURE</span>
                <span className="journey-dot" />
              </div>
              <div className="journey-route">
                <div className="journey-city">
                  <span className="city-pin"><FaMapMarkerAlt aria-hidden="true" /></span>
                  <strong>Choose a city</strong>
                  <small>Your starting point</small>
                </div>
                <div className="route-line"><span><FaBus aria-hidden="true" /></span></div>
                <div className="journey-city destination">
                  <span className="city-pin"><FaMapMarkerAlt aria-hidden="true" /></span>
                  <strong>Go somewhere new</strong>
                  <small>Make it memorable</small>
                </div>
              </div>
              <div className="journey-card-footer">
                <span><FaShieldAlt aria-hidden="true" /> Easy booking, better journeys</span>
                <span className="footer-spark">*</span>
              </div>
            </div>
            <div className="story-note">
              <span className="note-check"><FaArrowRight aria-hidden="true" /></span>
              <span><strong>Good trips start here.</strong><small>Travel at your own pace.</small></span>
            </div>
          </div>
          <span className="story-decoration decoration-a">W</span>
          <span className="story-decoration decoration-b">+</span>
        </section>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel-inner">
            <div className="mobile-mark"><FaBus aria-hidden="true" /></div>
            <p className="form-kicker">{isRegister ? "START YOUR STORY" : "WELCOME BACK"}</p>
            <h2 id="auth-title">{isRegister ? "Create your account" : "Let's get you going."}</h2>
            <p className="form-subtitle">
              {isRegister
                ? "Join us and make every journey count."
                : "Sign in to pick up where your next trip begins."}
            </p>

            {notice && <div className="form-notice" role="status">{notice}</div>}
            {error && <div className="form-error" role="alert">{error}</div>}

            <form className="auth-form" onSubmit={submitForm}>
              {isRegister && (
                <>
                  <label className="field-label" htmlFor="name">Full name</label>
                  <div className="input-wrap">
                    <FaUser className="input-icon" aria-hidden="true" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Morgan"
                      value={form.name}
                      onChange={updateField}
                      required
                    />
                  </div>
                </>
              )}

              <label className="field-label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <FaEnvelope className="input-icon" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </div>

              {isRegister && (
                <>
                  <label className="field-label" htmlFor="mobile">Mobile number</label>
                  <div className="input-wrap">
                    <FaPhone className="input-icon" aria-hidden="true" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Your contact number"
                      value={form.mobile}
                      onChange={updateField}
                      required
                    />
                  </div>

                  <label className="field-label" htmlFor="gender">Gender</label>
                  <div className="input-wrap select-wrap">
                    <FaUser className="input-icon" aria-hidden="true" />
                    <select id="gender" name="gender" value={form.gender} onChange={updateField} required>
                      <option value="" disabled>Select an option</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </>
              )}

              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <FaLock className="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                  minLength={isRegister ? 8 : undefined}
                  value={form.password}
                  onChange={updateField}
                  required
                />
              </div>

              {isRegister && (
                <>
                  <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                  <div className="input-wrap">
                    <FaLock className="input-icon" aria-hidden="true" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter your password again"
                      minLength={8}
                      value={form.confirmPassword}
                      onChange={updateField}
                      required
                    />
                  </div>
                </>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                <span>{isSubmitting ? "Please wait..." : isRegister ? "Create my account" : "Sign in"}</span>
                {!isSubmitting && <FaArrowRight aria-hidden="true" />}
              </button>
            </form>

            <div className="switch-mode">
              {isRegister ? "Already have an account?" : "New to Wayfare?"}
              <button type="button" onClick={() => changeMode(!isRegister)}>
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </div>
            <p className="secure-note"><FaShieldAlt aria-hidden="true" /> Your details stay safe and secure</p>
          </div>
          <footer className="auth-footer">© 2026 Wayfare <span>Made for the miles ahead.</span></footer>
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
