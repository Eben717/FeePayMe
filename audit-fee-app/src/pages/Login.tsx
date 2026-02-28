import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#f8fafc] bg-opacity-50">
            <div className="card w-full max-w-md p-8 glass animate-fade-in shadow-xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-4 shadow-sm">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-main">Welcome Back</h2>
                    <p className="text-muted text-sm mt-2">Sign in to FeePayMe Audit System</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label className="form-label text-left" htmlFor="username">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ marginLeft: '12px', marginTop: '12px', position: 'absolute' }}>
                                <User size={18} className="text-muted" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                className="form-input pl-10"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <label className="form-label mb-0" htmlFor="password">Password</label>
                            <a href="#" className="text-sm text-primary hover:underline" onClick={(e) => { e.preventDefault(); alert('Forgot Password functionality ready to be implemented.'); }}>
                                Forgot Password?
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ marginLeft: '12px', marginTop: '12px', position: 'absolute' }}>
                                <Lock size={18} className="text-muted" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="form-input pl-10"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full text-lg py-3 shadow-md mt-4">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
