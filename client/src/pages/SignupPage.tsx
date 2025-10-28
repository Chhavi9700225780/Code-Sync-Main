import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// --- FIX: Use relative path instead of alias ---
import { useAuth, api } from '../context/AuthContext'; // Assuming context is one level up

const SignupPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
        toast.loading('Creating your account...');

        try {
            // api instance comes from context, interceptor adds token header
            const response = await api.post('/api/auth/register', formData);

            toast.dismiss();
            toast.success('Account created successfully!');

            const { user, token } = response.data; // <-- Get token

            // Store token and user data
            setToken(token);
            setUser(user);
            console.log("Registered and logged in user:", user);

            navigate('/'); // Redirect home after signup

        } catch (error) {
            toast.dismiss();
             // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
            const errorMessage = error.response?.data?.message || 'Registration failed.';
            toast.error(errorMessage);
            console.error("Signup Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Create an Account</h1>

                 {/* REMOVED GitHub Button and OR divider */}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                     <div>
                        <label className="text-sm font-bold text-gray-400">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username} // Controlled component
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
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
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                {/* Link to Login */}
                <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;