import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Shield, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, reset } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isLoading, isError, isSuccess, message } = useAppSelector(
        (state) => state.auth
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            if (user?.role === 'provider') {
                navigate('/provider/dashboard');
            } else if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onSubmit = (data: LoginFormValues) => {
        dispatch(login(data));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 selection:bg-blue-100 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] space-y-8"
            >
                {/* Brand Identity */}
                <div className="text-center space-y-6">
                    <Link to="/" className="inline-flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">TowMe</span>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
                        <p className="text-sm font-medium text-slate-400">Please enter your credentials to access your account.</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 ring-1 ring-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                    placeholder="name@example.com"
                                />
                                {errors.email && (
                                    <p className="text-[10px] text-red-500 font-bold px-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                                    <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[10px] text-red-500 font-bold px-1">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] border-0"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <span className="flex items-center gap-2">Sign In <ArrowRight size={18} /></span>
                            )}
                        </Button>

                        <div className="pt-4 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Don't have an account?{' '}
                                <Link to="/register/customer" className="text-blue-600 font-bold hover:underline underline-offset-4 ml-1">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Secure 256-bit encrypted authentication</p>
                </div>
            </motion.div>
        </div>
    );
}
