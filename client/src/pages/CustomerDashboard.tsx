import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAppSelector } from '@/app/hooks';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Loader2, Shield, Clock, Map as MapIcon, Phone, History, User as UserIcon, XCircle, ChevronRight, Navigation, CreditCard, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { socket, connectSocket, disconnectSocket } from '@/services/socketService';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

const SERVICES = [
    { id: 'tow', label: 'Towing', icon: Navigation },
    { id: 'mechanic', label: 'Mobile Mechanic', icon: Shield },
    { id: 'tire', label: 'Flat Tire', icon: Clock },
    { id: 'fuel', label: 'Fuel Delivery', icon: Navigation },
    { id: 'lockout', label: 'Lockout Assistance', icon: Shield },
    { id: 'battery', label: 'Battery Jump', icon: Clock },
];

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'request' | 'history' | 'profile'>('request');
    const [currentLocation, setCurrentLocation] = useState<[number, number]>(DEFAULT_CENTER);
    const [activeRequest, setActiveRequest] = useState<any>(null);
    const [requestHistory, setRequestHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('tow');

    useEffect(() => {
        if (user) {
            connectSocket(user._id);
            fetchMyRequests();
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Geolocation error: ", error);
                    toast.warn("Unable to fetch location. Using default.");
                }
            );
        }

        socket.on('request_accepted', (data) => {
            toast.success("A service provider is on the way.");
            fetchMyRequests();
            if (data.requestId) socket.emit('join_job_room', data.requestId);
        });

        socket.on('status_changed', (status) => {
            fetchMyRequests();
            if (status === 'paid') {
                toast.success("Payment confirmed!");
            }
        });

        return () => {
            socket.off('request_accepted');
            socket.off('status_changed');
            disconnectSocket();
        }
    }, [user]);

    const fetchMyRequests = async () => {
        try {
            const token = user?.token;
            if (!token) return;

            const res = await api.get('/api/requests/my', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.length > 0) {
                const active = res.data.find((r: any) => ['pending', 'accepted', 'in_progress', 'pending_payment'].includes(r.status));
                setActiveRequest(active || null);
                setRequestHistory(res.data.filter((r: any) => ['completed', 'cancelled', 'paid'].includes(r.status)));
            } else {
                setActiveRequest(null);
                setRequestHistory([]);
            }
        } catch (error) {
            console.error("History fetch error:", error);
        }
    };

    const handleCreateRequest = async () => {
        setIsLoading(true);
        try {
            const token = user?.token;
            const payload = {
                serviceType: selectedService,
                coordinates: [currentLocation[1], currentLocation[0]],
                address: "Live Location",
                notes: "Requesting professional assistance",
            };

            const res = await api.post('/api/requests', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveRequest(res.data);
            setRequestModalOpen(false);
            toast.success("Request sent successfully.");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Unable to send request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!activeRequest) return;
        setIsLoading(true);
        try {
            const token = user?.token;
            await api.put(`/api/requests/${activeRequest._id}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Payment Successful!");
            socket.emit('status_change', { requestId: activeRequest._id, status: 'paid', customerId: user._id });
            fetchMyRequests();
        } catch (error) {
            toast.error("Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!activeRequest) return;
        if (!window.confirm("Are you sure you want to cancel this request?")) return;

        try {
            const token = user?.token;
            await api.put(`/api/requests/${activeRequest._id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.info("Request cancelled.");
            setActiveRequest(null);
            socket.emit('cancel_request', { requestId: activeRequest._id, customerId: user._id });
        } catch (error: any) {
            toast.error("Failed to cancel request.");
        }
    };

    const onLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
            {/* Map Background Wrapper */}
            <div className={`flex-1 relative transition-opacity duration-700 ${activeTab === 'request' ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
                <MapComponent center={currentLocation} userLocation={currentLocation} zoom={15} />
            </div>

            {/* Sidebar Dashboard */}
            <div className="absolute top-0 left-0 bottom-0 z-[1000] w-full max-w-[420px] bg-white border-r border-slate-200 shadow-2xl flex flex-col">
                {/* User Info Header */}
                <header className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name[0]}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Verified Member</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'request' && (
                            <motion.div
                                key="request-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-6"
                            >
                                {!activeRequest ? (
                                    <div className="space-y-8 py-10">
                                        <div className="text-center space-y-3">
                                            <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center border border-blue-100">
                                                <Shield className="text-blue-600" size={32} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900">Need Assistance?</h3>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed">Select a service and get connected with a professional partner in minutes.</p>
                                        </div>
                                        <Button
                                            onClick={() => setRequestModalOpen(true)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 text-lg rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                                        >
                                            Request Service
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                ) : activeRequest.status === 'pending_payment' ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="subtle-panel p-8 space-y-8 bg-blue-600 text-white border-blue-500 shadow-2xl">
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                                                <CreditCard size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-bold">Service Complete</h4>
                                                <p className="text-blue-100 text-sm">Please finalize the payment to complete the request.</p>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                                <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">Service Fee</span>
                                                <span className="text-2xl font-black">${activeRequest.finalPrice || 45}.00</span>
                                            </div>
                                            <div className="text-[10px] text-blue-200 uppercase tracking-tighter">
                                                Provider: {activeRequest.provider?.name} • Unit #709
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handlePayment}
                                            disabled={isLoading}
                                            className="w-full bg-white text-blue-600 hover:bg-blue-50 py-8 text-lg font-bold rounded-2xl shadow-xl transition-all active:scale-95"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin text-blue-600" /> : "Pay Now"}
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="subtle-panel p-6 space-y-6 bg-blue-50/30 border-blue-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Active Request</p>
                                                <h4 className="text-xl font-bold text-slate-900 capitalize">{activeRequest.serviceType} Assistance</h4>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-tighter">
                                                {activeRequest.status.replace('_', ' ')}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-slate-400" size={18} />
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Arrival</p>
                                                    <p className="text-base font-bold text-slate-900">Within 15 minutes</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: "20%" }}
                                                    animate={{ width: activeRequest.status === 'accepted' ? '60%' : activeRequest.status === 'in_progress' ? '85%' : '20%' }}
                                                    className="h-full bg-blue-600"
                                                />
                                            </div>
                                        </div>

                                        {activeRequest.provider ? (
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                                        {activeRequest.provider.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Technician</p>
                                                        <p className="text-sm font-bold text-slate-900">{activeRequest.provider.name}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                                    <Phone size={20} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="py-6 flex items-center justify-center gap-3 bg-white/50 rounded-xl border border-dashed border-slate-200">
                                                <Loader2 className="animate-spin text-blue-600" size={20} />
                                                <p className="text-xs font-semibold text-slate-500">Contacting nearby partners...</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCancelRequest}
                                            className="w-full py-4 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                                        >
                                            Cancel Request
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                                </div>
                                {requestHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {requestHistory.map(req => (
                                            <div key={req._id} className="subtle-panel p-5 space-y-4 hover:border-blue-200 transition-all group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl ${req.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                                            {req.status === 'paid' ? <Check size={20} /> : <XCircle size={20} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-slate-900 capitalize">{req.serviceType} Assistance</h4>
                                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    {req.status === 'paid' && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900">${req.finalPrice || 45}.00</p>
                                                            <p className="text-[9px] text-green-600 font-bold uppercase">PAID</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                                    <span>Ref: {req._id.slice(-8).toUpperCase()}</span>
                                                    <span>Provider: {req.provider?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 opacity-40">
                                        <History size={40} className="mx-auto mb-4 text-slate-200" />
                                        <p className="text-sm font-semibold text-slate-400">No past activity found</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-6"
                            >
                                <div className="subtle-panel p-8 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-900 font-bold text-3xl">
                                        {user?.name[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user?.email}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Assists</p>
                                            <p className="text-base font-bold text-slate-900">{requestHistory.filter(r => r.status === 'paid').length}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                                            <p className="text-base font-bold text-blue-600 uppercase tracking-tighter">Gold</p>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={onLogout} variant="outline" className="w-full py-6 border-slate-200 text-red-500 hover:bg-red-50 font-bold rounded-xl space-x-2">
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Bottom Navigation */}
                <nav className="p-5 border-t border-slate-100 bg-white">
                    <div className="flex justify-around items-center">
                        <NavButton active={activeTab === 'request'} icon={MapIcon} label="Request" onClick={() => setActiveTab('request')} />
                        <NavButton active={activeTab === 'history'} icon={History} label="History" onClick={() => setActiveTab('history')} />
                        <NavButton active={activeTab === 'profile'} icon={UserIcon} label="Profile" onClick={() => setActiveTab('profile')} />
                    </div>
                </nav>
            </div>

            {/* Service Selection Modal */}
            <AnimatePresence>
                {requestModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl border border-slate-100"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Select Service</h3>
                            <div className="grid grid-cols-2 gap-3 mb-10">
                                {SERVICES.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(service.id)}
                                        className={`p-6 rounded-2xl border transition-all text-center space-y-3 active:scale-95 ${selectedService === service.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                                            }`}
                                    >
                                        <service.icon size={24} className="mx-auto" />
                                        <p className="font-bold text-xs uppercase tracking-wider">{service.label}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 py-7 rounded-2xl text-slate-500 font-bold" onClick={() => setRequestModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1 py-7 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100" onClick={handleCreateRequest} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Selection'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavButton({ active, icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1.5 transition-all w-16 ${active ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Icon size={20} weight={active ? 'bold' : 'regular'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}
