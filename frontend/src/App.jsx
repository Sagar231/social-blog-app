import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Editor from "./pages/Editor.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "./pages/Notifications.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  // Wait for auth restoration before rendering any page, so the first data
  // fetch carries the access token (otherwise it's an anonymous request and
  // per-user state like "is_liked" comes back wrong).
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Navbar />
        <div className="grid place-items-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-pink" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-6">
        <Routes>
          <Route
            path="/"
            element={
              loading ? null : user ? <Home /> : <Landing />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route
            path="/new"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />
          <Route
            path="/edit/:slug"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />
          <Route
            path="/notifications"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
