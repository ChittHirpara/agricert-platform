import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw, Wheat, Search, Package, UserSearch } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleSwitcher = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    // Only show if user is logged in
    if (!user) return null;

    const handleSwitchRole = async (roleType) => {
        setIsSwitching(true);
        setIsOpen(false);

        const demoMapping = {
            farmer: { username: "DemoFarmer", expectedRole: "exporter" },
            certifier: { username: "DemoCertifier", expectedRole: "qa" },
            distributor: { username: "DemoDistributor", expectedRole: "importer" },
            consumer: { username: "DemoConsumer", expectedRole: "importer" },
        };

        const targetDemo = demoMapping[roleType];

        // If trying to switch to current role, just close
        if (user.username === targetDemo.username) {
            toast('Already logged in as ' + roleType, { icon: 'ℹ️' });
            setIsSwitching(false);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/login`, {
                username: targetDemo.username,
                password: "demo123"
            });

            const newUser = res.data.user;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);

            toast.success(`Switched to ${roleType} persona!`);

            // Hard reload to flush any specific dashboard states
            setTimeout(() => window.location.href = '/', 500);

        } catch (err) {
            console.error(err);
            toast.error('Failed to switch roles.');
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {isOpen && (
                <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-4 mb-4 w-64 animate-fadeIn slideUp flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">Demo Role Switcher</h4>

                    <button onClick={() => handleSwitchRole('farmer')} className="flex items-center gap-3 w-full p-2 hover:bg-green-50 rounded-lg text-sm text-gray-700 transition-colors">
                        <div className="bg-green-100 p-1.5 rounded-md text-green-600"><Wheat size={16} /></div>
                        Farmer Demo
                    </button>
                    <button onClick={() => handleSwitchRole('certifier')} className="flex items-center gap-3 w-full p-2 hover:bg-blue-50 rounded-lg text-sm text-gray-700 transition-colors">
                        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600"><Search size={16} /></div>
                        Certifier Demo
                    </button>
                    <button onClick={() => handleSwitchRole('distributor')} className="flex items-center gap-3 w-full p-2 hover:bg-purple-50 rounded-lg text-sm text-gray-700 transition-colors">
                        <div className="bg-purple-100 p-1.5 rounded-md text-purple-600"><Package size={16} /></div>
                        Distributor Demo
                    </button>
                    <button onClick={() => handleSwitchRole('consumer')} className="flex items-center gap-3 w-full p-2 hover:bg-pink-50 rounded-lg text-sm text-gray-700 transition-colors">
                        <div className="bg-pink-100 p-1.5 rounded-md text-pink-600"><UserSearch size={16} /></div>
                        Consumer Demo
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isSwitching}
                className="bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center border-4 border-gray-100"
                title="Switch Demo Accounts fast"
            >
                <RefreshCw size={24} className={isSwitching ? 'animate-spin text-green-400' : ''} />
            </button>
        </div>
    );
};

export default RoleSwitcher;
