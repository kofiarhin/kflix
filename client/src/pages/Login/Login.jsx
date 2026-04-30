import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/profile";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell grid min-h-[calc(100dvh-5rem)] place-items-center">
      <div className="glass-panel w-full max-w-md rounded-[1.75rem] p-8 text-white">
      <p className="eyebrow mb-3">Member access</p>
      <h1 className="mb-2 text-4xl font-black tracking-tight">Login</h1>
      <p className="mb-6 text-sm leading-6 text-slate-300">Welcome back to Kflix.</p>

      {error && <p className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/12 p-3 text-sm text-red-200">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="field-control"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="field-control"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        No account?{" "}
        <Link className="font-semibold text-red-200 hover:text-white" to="/register">
          Register here
        </Link>
      </p>
      </div>
    </section>
  );
};

export default Login;
