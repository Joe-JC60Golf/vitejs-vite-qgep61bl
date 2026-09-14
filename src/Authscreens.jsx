// AuthScreens.jsx
// Real Firebase-backed versions of Login, CreateAccount, and Forgot.
// Drop this in your src/ folder alongside firebase.js, and swap the
// fake versions in your app for these. Styling matches the mockup —
// adjust COLORS import to wherever your design tokens live.

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

// Human-readable messages for the Firebase error codes you'll hit most often.
function friendlyAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with that email.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts — wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function Login({ onForgot, onCreate, onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to log in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess(cred.user);
    } catch (err) {
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <button onClick={onBack} style={backButtonStyle}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, marginBottom: 28 }}>Member login</div>

      <form onSubmit={handleSubmit}>
        <FieldLabel>Email</FieldLabel>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />

        <FieldLabel style={{ marginTop: 16 }}>Password</FieldLabel>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div style={{ textAlign: "right", marginTop: 8 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onForgot(); }} style={{ fontSize: 13, textDecoration: "none" }}>
            Forgot password?
          </a>
        </div>

        {error && <div style={{ color: "#D64545", fontSize: 13, marginTop: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, marginTop: 20 }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 22, fontSize: 13 }}>
        New here?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onCreate(); }} style={{ textDecoration: "none", fontWeight: 500 }}>
          Create an account
        </a>
      </div>
    </div>
  );
}

export function CreateAccount({ onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Fill in every field to create your account.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      // Store the display name and any other profile basics in Firestore,
      // keyed by the user's real auth uid — this is what "My profile" reads from.
      await setDoc(doc(db, "members", cred.user.uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        createdAt: Date.now(),
      });
      setDone(true);
    } catch (err) {
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ paddingTop: 48 }}>
        <button onClick={onBack} style={backButtonStyle}>
          <ArrowLeft size={16} /> Back to login
        </button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 60 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#256A98", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Check size={26} color="#fff" />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, marginBottom: 8 }}>Account created</div>
          <div style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>Head back to the login screen and sign in with your new details.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <button onClick={onBack} style={backButtonStyle}>
        <ArrowLeft size={16} /> Back to login
      </button>

      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, marginBottom: 22 }}>Create an account</div>

      <form onSubmit={handleSubmit}>
        <FieldLabel>Name</FieldLabel>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={inputStyle} />

        <FieldLabel style={{ marginTop: 16 }}>Email</FieldLabel>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" style={inputStyle} />

        <FieldLabel style={{ marginTop: 16 }}>Password</FieldLabel>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password (6+ characters)" style={inputStyle} />

        <FieldLabel style={{ marginTop: 16 }}>Confirm password</FieldLabel>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter your password" style={inputStyle} />

        {error && <div style={{ color: "#D64545", fontSize: 13, marginTop: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, marginTop: 22 }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}

export function Forgot({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError("Enter the email on your account.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      // Firebase intentionally doesn't reveal whether the email exists,
      // to stop attackers from checking which emails are registered —
      // so this success message shows regardless.
      setSent(true);
    } catch (err) {
      if (err.code === "auth/invalid-email") setError(friendlyAuthError(err.code));
      else setSent(true); // still show success for anything else, same reason as above
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <button onClick={onBack} style={backButtonStyle}>
        <ArrowLeft size={16} /> Back to login
      </button>

      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Reset your password</div>

      {sent ? (
        <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Enter your email and we'll send a link to reset your password.</div>
          <form onSubmit={handleSubmit}>
            <FieldLabel>Email</FieldLabel>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />

            {error && <div style={{ color: "#D64545", fontSize: 13, marginTop: 12 }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, marginTop: 20 }}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function FieldLabel({ children, style }) {
  return <div style={{ fontSize: 12, marginBottom: 6, ...style }}>{children}</div>;
}

const backButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: "none",
  fontSize: 13,
  cursor: "pointer",
  padding: 0,
  marginBottom: 24,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 6,
  border: "1px solid #26445A",
  background: "#081722",
  color: "#F2F5F7",
  fontSize: 14,
};

const primaryButtonStyle = {
  width: "100%",
  background: "#4394CD",
  color: "#0D2233",
  border: "none",
  borderRadius: 6,
  padding: "13px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

