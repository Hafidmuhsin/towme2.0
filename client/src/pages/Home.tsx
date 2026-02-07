import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, CheckCircle, ArrowRight, Menu, X, Users, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">TowMe</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        <div className="flex items-center gap-8">
                            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                            <Link to="/register/provider" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Become a Partner</Link>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-semibold px-4">Log in Harmony</Button>
                            </Link>
                            <Link to="/register/customer">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-7 rounded-full font-bold shadow-md shadow-blue-200">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-600">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl"
                    >
                        <Link to="/register/provider" className="block text-lg font-semibold text-slate-700">Become a Partner</Link>
                        <Link to="/login" className="block text-lg font-semibold text-slate-700">Log in</Link>
                        <Link to="/register/customer">
                            <Button className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl">Get Started</Button>
                        </Link>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-800 tracking-wider uppercase">Active Coverage Nationwide</span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-6xl lg:text-7.5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                                Professional <span className="text-blue-600">Roadside</span> Care.
                            </h1>
                            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
                                Reliable, on-demand assistance for every driver. We bridge the gap between unexpected vehicle issues and professional, verified solutions.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <Link to="/register/customer" className="flex-1 sm:flex-none">
                                <Button className="w-full sm:w-auto px-10 py-7.5 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl shadow-xl shadow-blue-100 transition-all hover:translate-y-[-2px]">
                                    Request Assistance
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/register/provider" className="flex-1 sm:flex-none">
                                <Button variant="outline" className="w-full sm:w-auto px-10 py-7.5 text-lg font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl">
                                    Join Network
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-10 pt-10 border-t border-slate-100">
                            <div className="space-y-1">
                                <p className="text-2xl font-extrabold text-slate-900">8.2min</p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Avg Response</p>
                            </div>
                            <div className="h-8 w-px bg-slate-100"></div>
                            <div className="space-y-1">
                                <p className="text-2xl font-extrabold text-slate-900">50,000+</p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Total Assists</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="aspect-[4/5] bg-slate-100 rounded-[3.5rem] overflow-hidden shadow-3xl border-8 border-white p-4">
                            <img
                                src="https://images.unsplash.com/photo-1618762044398-ec1e7e048bbd?q=80&w=1974&auto=format&fit=crop"
                                alt="Professional Roadside Support"
                                className="w-full h-full object-cover rounded-[2.5rem]"
                            />
                        </div>
                        {/* Overlay Card */}
                        <div className="absolute top-20 -left-12 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 w-72 animate-bounce-subtle">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-green-50 rounded-2xl">
                                    <CheckCircle className="text-green-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technician Found</p>
                                    <p className="text-base font-bold text-slate-900">David Is En Route</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-1.5 flex-1 bg-green-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-green-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section id="features" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Clock,
                                title: "Around the Clock Support",
                                desc: "Vehicle issues don't follow a schedule. Our dispatch team is available 24 hours a day, 365 days a year."
                            },
                            {
                                icon: MapPin,
                                title: "Precise Geolocation",
                                desc: "No more describing landmarks. We use high-precision GPS to find your exact location on the road."
                            },
                            {
                                icon: Users,
                                title: "Verified Network",
                                desc: "Safety is paramount. Every service provider in our network undergoes rigorous background checks and training."
                            }
                        ].map((item, i) => (
                            <div key={i} className="space-y-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <item.icon className="text-blue-600 w-8 h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                            Drive safely, knowing <br /> we have your back.
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                            Join thousands of drivers who trust TowMe for their roadside needs. Registration takes less than 60 seconds.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register/customer">
                            <Button className="px-10 py-7 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-lg">
                                Register as a Driver
                            </Button>
                        </Link>
                        <Link to="/register/provider">
                            <Button variant="outline" className="px-10 py-7 border-slate-700 text-white hover:bg-white/5 font-bold rounded-2xl text-lg">
                                Partner With Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Shield className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">TowMe</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                        © 2026 TowMe Roadside Assistance. Professional Reliability.
                    </p>
                    <div className="flex gap-8 text-sm font-semibold text-slate-500">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
