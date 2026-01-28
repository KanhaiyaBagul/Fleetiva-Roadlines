import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AppContext } from "../context/AppContext";
import Toast from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();
  const { loading, setLoading } = useContext(AppContext);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  setError("");
  setLoading(true);

  try {
    await api.post("/auth/register", formData);
    navigate("/login"); // 🔥 redirect directly
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

 

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        {error && <Toast message={error} />}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Company Name"
            style={styles.input}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
          />

          <input
            placeholder="Full Name"
            required
            style={styles.input}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            placeholder="Phone Number"
            required
            style={styles.input}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            style={styles.input}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <select
            value={formData.role}
            style={styles.input}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: 420,
    padding: 30,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 14,
  },
  button: {
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
