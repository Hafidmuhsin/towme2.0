import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Shield, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register as registerUser, reset } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

const registerSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterCustomer() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isLoading, isError, isSuccess, message } = useAppSelector(
        (state) => state.auth
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            navigate('/dashboard');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onSubmit = (data: RegisterFormValues) => {
        dispatch(registerUser({ ...data, role: 'customer' }));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 py-20 selection:bg-blue-100 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[540px] space-y-8"
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
                        <h1 className="text-2xl font-extrabold text-slate-900">Create an Account</h1>
                        <p className="text-sm font-medium text-slate-400">Join our community of drivers for reliable roadside support.</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 ring-1 ring-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && (
                                        <p className="text-[10px] text-red-500 font-bold px-1">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                        placeholder="000 000 0000"
                                    />
                                    {errors.phone && (
                                        <p className="text-[10px] text-red-500 font-bold px-1">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="text-[10px] text-red-500 font-bold px-1">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                                    <input
                                        {...register('confirmPassword')}
                                        type="password"
                                        className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-[10px] text-red-500 font-bold px-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] border-0"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <span className="flex items-center gap-2">Create Account <ArrowRight size={18} /></span>
                            )}
                        </Button>

                        <div className="pt-4 text-center space-y-4">
                            <p className="text-sm font-medium text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4 ml-1">
                                    Sign In
                                </Link>
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                    Are you a provider?{' '}
                                    <Link to="/register/provider" className="text-slate-900 font-bold hover:text-blue-600 transition-colors ml-1">
                                        Partner Registration
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
