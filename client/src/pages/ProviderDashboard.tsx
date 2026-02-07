import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { RefreshCw, Power, Navigation, Shield, CheckCircle, Activity, Phone, Loader2, History, User as UserIcon, CheckCircle2, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/authSlice';
import { socket, connectSocket, disconnectSocket } from '@/services/socketService';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'ops' | 'history' | 'profile'>('ops');
    const [isOnline, setIsOnline] = useState(false);
    const [activeJob, setActiveJob] = useState<any>(null);
    const [nearbyRequests, setNearbyRequests] = useState<any[]>([]);
    const [jobHistory, setJobHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<[number, number]>(DEFAULT_CENTER);
    const [finalPriceInput, setFinalPriceInput] = useState("45");

    const updateLiveLocation = useCallback(async (coords: [number, number]) => {
        try {
            const token = user?.token;
            if (token) {
                await axios.put('/api/auth/location', {
                    coordinates: [coords[1], coords[0]],
                    address: "Live Tracking Active"
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Tracking sync failed");
        }
    }, [user?.token]);

    const fetchRequests = useCallback(async () => {
        if (!isOnline) return;
        setIsLoading(true);
        try {
            const token = user?.token;
            if (token) {
                const res = await axios.get(`/api/requests/nearby?longitude=${currentLocation[1]}&latitude=${currentLocation[0]}&radius=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNearbyRequests(res.data);
            }
        } catch (error) {
            console.error("Nearby fetch failed");
        } finally {
            setIsLoading(false);
        }
    }, [isOnline, user?.token, currentLocation]);

    const fetchHistory = useCallback(async () => {
        try {
            const token = user?.token;
            if (token) {
                const res = await axios.get('/api/requests/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const active = res.data.find((r: any) => ['accepted', 'in_progress', 'pending_payment'].includes(r.status));
                setActiveJob(active || null);
                setJobHistory(res.data.filter((r: any) => ['completed', 'cancelled', 'paid'].includes(r.status)));
            }
        } catch (error) {
            console.error("History fetch failed");
        }
    }, [user?.token]);

    useEffect(() => {
        if (user) {
            connectSocket(user._id);
            fetchHistory();
        }

        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setCurrentLocation(newCoords);
                    if (isOnline) updateLiveLocation(newCoords);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        }

        socket.on('new_job_available', (job) => {
            if (isOnline && !activeJob) {
                setNearbyRequests(prev => [job, ...prev]);
                toast.info("A new service request is available nearby.");
            }
        });

        socket.on('status_changed', (status) => {
            fetchHistory();
            if (status === 'cancelled') {
                toast.warn("The customer has cancelled the request.");
            } else if (status === 'paid') {
                toast.success("Payment received for the last job!");
            }
        });

        return () => {
            socket.off('new_job_available');
            socket.off('status_changed');
            if (watchId) navigator.geolocation.clearWatch(watchId);
            disconnectSocket();
        }
    }, [user, isOnline, activeJob, fetchRequests, fetchHistory, updateLiveLocation]);

    const handleAcceptRequest = async (requestId: string) => {
        try {
            const token = user?.token;
            if (token) {
                const res = await axios.put(`/api/requests/${requestId}/accept`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Request accepted. Proceed to location.");

                const job = nearbyRequests.find(r => r._id === requestId) || res.data;
                setActiveJob(job);
                setNearbyRequests([]);
                socket.emit('accept_request', {
                    requestId,
                    customerId: job.customer._id,
                    providerData: user
                });
            }
        } catch (error: any) {
            toast.error("Unable to accept this request.");
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!activeJob) return;
        try {
            const token = user?.token;
            if (token) {
                await axios.put(`/api/requests/${activeJob._id}/status`, { status }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.info(`Status updated to ${status.replace('_', ' ')}`);
                socket.emit('status_change', { requestId: activeJob._id, status, customerId: activeJob.customer?._id || activeJob.customer });
                fetchHistory();
            }
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleCompleteJob = async () => {
        if (!activeJob) return;
        const price = parseFloat(finalPriceInput);
        if (isNaN(price)) {
            toast.error("Please enter a valid price.");
            return;
        }

        try {
            const token = user?.token;
            if (token) {
                await axios.put(`/api/requests/${activeJob._id}/complete`, { finalPrice: price }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Job marked as complete. Awaiting customer payment.");

                socket.emit('status_change', {
                    requestId: activeJob._id,
                    status: 'pending_payment',
                    customerId: activeJob.customer?._id || activeJob.customer
                });

                fetchHistory();
            }
        } catch (error: any) {
            toast.error("Failed to complete service.");
        }
    };

    const onLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            {/* Sidebar Control Panel */}
            <aside className="absolute md:relative top-0 left-0 bottom-0 w-full md:w-[420px] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col">

                {/* Provider Identity */}
                <header className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                            {user?.name[0]}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certified Provider • Partner #709</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'ops' && (
                            <motion.div
                                key="ops-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-6"
                            >
                                <Button
                                    onClick={() => setIsOnline(!isOnline)}
                                    className={`w-full py-8 text-xl font-bold rounded-2xl transition-all duration-300 border-0 ${isOnline ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    <Power className="mr-3" size={24} />
                                    {isOnline ? 'Active & Online' : 'Go Online'}
                                </Button>

                                {activeJob ? (
                                    <div className={`subtle-panel p-6 space-y-6 ${activeJob.status === 'pending_payment' ? 'bg-orange-50/50 border-orange-100' : 'bg-blue-50/50 border-blue-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Activity size={16} className={activeJob.status !== 'pending_payment' ? 'animate-pulse' : ''} />
                                                <span className="text-[10px] font-bold tracking-widest uppercase">
                                                    {activeJob.status === 'pending_payment' ? 'Awaiting Payment' : 'Ongoing Service'}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeJob.status === 'pending_payment' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {activeJob.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold text-slate-900 capitalize">{activeJob.serviceType} Recovery</h3>
                                            <p className="text-slate-500 text-xs font-medium">{activeJob.location?.address}</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-600">
                                                    {(activeJob.customer?.name || 'C')[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                                                    <p className="text-sm font-bold text-slate-900">{activeJob.customer?.name || 'Customer'}</p>
                                                </div>
                                            </div>
                                            <button className="p-3 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors">
                                                <Phone size={18} />
                                            </button>
                                        </div>

                                        {activeJob.status === 'pending_payment' ? (
                                            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-3">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expected Revenue</p>
                                                <p className="text-3xl font-black text-slate-900">${activeJob.finalPrice || 45}.00</p>
                                                <div className="flex items-center justify-center gap-2 text-orange-600 pt-2 font-bold text-[11px] animate-pulse">
                                                    <Loader2 size={12} className="animate-spin" />
                                                    WAITING FOR CUSTOMER ACTION
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-white/50 p-4 rounded-xl border border-slate-100 space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Set Service Fee ($)</label>
                                                    <input
                                                        type="number"
                                                        value={finalPriceInput}
                                                        onChange={(e) => setFinalPriceInput(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-lg font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button variant="outline" className="py-6 rounded-xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">
                                                        <Navigation size={14} className="mr-2" /> Navigate
                                                    </Button>
                                                    {activeJob.status === 'accepted' ? (
                                                        <Button
                                                            onClick={() => handleUpdateStatus('in_progress')}
                                                            className="bg-blue-600 hover:bg-blue-700 py-6 rounded-xl text-white font-bold text-xs uppercase tracking-widest border-0"
                                                        >
                                                            <Activity size={14} className="mr-2" /> Start Service
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={handleCompleteJob}
                                                            className="bg-green-600 hover:bg-green-700 py-6 rounded-xl text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 border-0"
                                                        >
                                                            <CheckCircle size={14} className="mr-2" /> Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : isOnline ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Available Jobs</h3>
                                            <button onClick={fetchRequests} className="text-blue-600 hover:rotate-180 transition-transform duration-500">
                                                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                        {nearbyRequests.length > 0 ? nearbyRequests.map(req => (
                                            <div key={req._id} className="subtle-panel p-5 hover:border-blue-200 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-lg text-slate-800 capitalize">{req.serviceType}</h4>
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Nearby</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium mb-5 line-clamp-1">{req.location.address}</p>
                                                <Button
                                                    onClick={() => handleAcceptRequest(req._id)}
                                                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-6 rounded-xl border-0 transition-transform active:scale-[0.98]"
                                                >
                                                    Accept Job
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                <Loader2 className="animate-spin mx-auto mb-3 text-slate-300" size={24} />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Requests...</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                            <Shield size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-slate-900">Offline</h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Go online to see <br /> customer requests in your area.</p>
                                        </div>
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
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Service History</h3>
                                {jobHistory.map(job => (
                                    <div key={job._id} className="subtle-panel p-5 space-y-4 border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${job.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'} flex items-center justify-center`}>
                                                    {job.status === 'paid' ? <Check size={20} /> : <CheckCircle2 size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-base capitalize">{job.serviceType}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(job.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-slate-900">${job.finalPrice || 45}.00</p>
                                                <p className={`text-[9px] font-bold uppercase ${job.status === 'paid' ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {job.status === 'paid' ? 'DISBURSED' : job.status.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                            <span>Cust: {job.customer?.name || 'Verified Customer'}</span>
                                            <span>ID: {job._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                                {jobHistory.length === 0 && <p className="text-center py-20 text-xs font-bold text-slate-300 uppercase tracking-widest">No activity found</p>}
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
                                    <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-50">
                                        {user?.name[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                                        <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Verified Partner</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Rating</p>
                                            <p className="text-base font-bold text-slate-900">4.9</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Impact</p>
                                            <p className="text-base font-bold text-slate-900">{jobHistory.filter(j => j.status === 'paid').length}</p>
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

                {/* Navigation Hub */}
                <nav className="p-5 border-t border-slate-100 bg-white">
                    <div className="flex justify-around items-center">
                        <NavButton active={activeTab === 'ops'} icon={Activity} label="Work" onClick={() => setActiveTab('ops')} />
                        <NavButton active={activeTab === 'history'} icon={History} label="Activity" onClick={() => setActiveTab('history')} />
                        <NavButton active={activeTab === 'profile'} icon={UserIcon} label="Account" onClick={() => setActiveTab('profile')} />
                    </div>
                </nav>
            </aside>

            {/* Map Area */}
            <main className={`flex-1 relative transition-opacity duration-1000 ${activeTab === 'ops' ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
                <MapComponent center={currentLocation} userLocation={currentLocation} zoom={14} />
            </main>
        </div>
    );
};

function NavButton({ active, icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1.5 transition-all w-16 ${active ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}

export default ProviderDashboard;
