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
    <section className="mx-auto mt-8 flex max-w-md flex-col rounded-2xl border border-white/10 bg-slate-900 p-8 text-white">
      <h1 className="mb-2 text-3xl font-bold">Login</h1>
      <p className="mb-6 text-sm text-slate-300">Welcome back to Kflix.</p>

      {error && <p className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-300">{error}</p>}

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
            className="w-full rounded-md border border-white/20 bg-slate-800 px-4 py-2 outline-none transition focus:border-red-400"
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
            className="w-full rounded-md border border-white/20 bg-slate-800 px-4 py-2 outline-none transition focus:border-red-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        No account?{" "}
        <Link className="font-semibold text-red-400 hover:text-red-300" to="/register">
          Register here
        </Link>
      </p>
    </section>
  );
};

export default Login;
