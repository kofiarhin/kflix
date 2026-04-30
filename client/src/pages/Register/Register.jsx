import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/profile", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell grid min-h-[calc(100dvh-5rem)] place-items-center">
      <div className="glass-panel w-full max-w-md rounded-[1.75rem] p-8 text-white">
      <p className="eyebrow mb-3">Start watching</p>
      <h1 className="mb-2 text-4xl font-black tracking-tight">Register</h1>
      <p className="mb-6 text-sm leading-6 text-slate-300">Create your Kflix account.</p>

      {error && <p className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/12 p-3 text-sm text-red-200">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="field-control"
          />
        </div>

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
            minLength={6}
            className="field-control"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        Already have an account?{" "}
        <Link className="font-semibold text-red-200 hover:text-white" to="/login">
          Login here
        </Link>
      </p>
      </div>
    </section>
  );
};

export default Register;
