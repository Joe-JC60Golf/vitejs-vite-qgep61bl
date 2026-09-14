import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Login, CreateAccount, Forgot } from "./Authscreens";
import "./storage-polyfill";
import AppShell from "./AppShell";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const pageStyle = {
    background: "#0D2233",
    minHeight: "100vh",
    color: "#F2F5F7",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    justifyContent: "center",
  };

  if (checkingAuth) {
    return (
      <div style={{ ...pageStyle, alignItems: "center" }}>
        Loading…
      </div>
    );
  }

  if (user) {
    return <AppShell onLogOut={() => auth.signOut()} />;
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
        {screen === "login" && (
          <Login
            onForgot={() => setScreen("forgot")}
            onCreate={() => setScreen("create")}
            onBack={() => setScreen("login")}
            onSuccess={() => {}}
          />
        )}
        {screen === "create" && <CreateAccount onBack={() => setScreen("login")} />}
        {screen === "forgot" && <Forgot onBack={() => setScreen("login")} />}
      </div>
    </div>
  );
}
