import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// --- FIX: Use relative path instead of alias ---
import { useAuth, api } from '../context/AuthContext'; // Assuming context is one level up

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
  
    const { setUser, setToken } = useAuth(); // <-- Get setToken

    // REMOVED: backendUrl variable
    // REMOVED: handleGitHubLogin function

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        toast.loading('Logging in...');

        try {
            // api instance comes from context, interceptor adds token header
            // REMOVED: { withCredentials: true }
            const response = await api.post('/api/auth/login', formData);

            toast.dismiss();
            toast.success('Logged in successfully!');

            const { user, token } = response.data; // <-- Get token from response

            // Store token in localStorage and context state
            setToken(token);
            // Store user in context state
            setUser(user);
            console.log("Logged in user:", user); // For testing

            navigate('/'); // Redirect to home

        } catch (error) {
            toast.dismiss();
            // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
            const errorMessage = error.response?.data?.message || 'Login failed.';
            toast.error(errorMessage);
            console.error("Login Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Welcome Back!</h1>

                {/* REMOVED GitHub Login Button and OR divider */}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="text-sm font-bold text-gray-400">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email} // Controlled component
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {/* Password Input */}
                    <div>
                        <label className="text-sm font-bold text-gray-400">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password} // Controlled component
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full p-3 font-bold text-black bg-primary rounded-md disabled:opacity-50 hover:bg-green-400 transition"
                    >
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
                {/* Link to Signup */}
                <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

