import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./../../api";
import Cookies from "js-cookie";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post("/api/admin/login", {
                email,
                password,
            });

            if (res.status === 200) {
                const token = res.data?.token;

                if (token) {
                    // Store token in cookie
                    Cookies.set("adminToken", token, { expires: 1 }); // expires in 1 day

                    // Navigate to dashboard
                    navigate("/admin/dashboard");
                } else {
                    setError("Token not found in response.");
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-300 px-4">
            <div className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl shadow-lg p-10 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-6 drop-shadow">Admin Login</h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-blue-900 font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded border border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-blue-900 font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded border border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-2 px-2 flex items-center text-blue-600 hover:text-blue-800"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-700 font-medium text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>

            <button
                onClick={() => navigate("/")}
                className="
    fixed 
    left-1/2 
    bottom-6 
    transform 
    -translate-x-1/2 

    md:top-8 
    md:left-8 
    md:bottom-8
    md:transform-none

    bg-blue-600 
    hover:bg-blue-700 
    text-white 
    rounded-full 
    w-16 
    h-16 
    flex 
    items-center 
    justify-center 
    text-xl 
    font-bold 
    shadow-lg 
    transition
  "
                title="Go to Home"
            >
                🏠
            </button>
        </div>
    );
}
