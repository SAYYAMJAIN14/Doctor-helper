import React from 'react';
import { SosIcon } from './icons/SosIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ChatBubbleHeartIcon } from './icons/ChatBubbleHeartIcon';

interface SafetyDashboardProps {
    onBack: () => void;
}

// FIX: The `icon` prop type was too generic (`React.ReactElement`), which
// caused TypeScript to fail to infer the props of the cloned element.
// By specifying `React.ReactElement<React.SVGProps<SVGSVGElement>>`,
// we inform TypeScript that the icon accepts SVG props, including `className`.
const SafetyFeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; onClick?: () => void; className?: string }> = ({ title, description, icon, onClick, className }) => (
    <div
        onClick={onClick}
        className={`relative p-5 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${className}`}
    >
        <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-black/5`}>
                {React.cloneElement(icon, { className: `w-7 h-7 text-gray-700` })}
            </div>
            <div className="ml-4">
                <h3 className={`text-lg font-bold text-gray-800`}>{title}</h3>
                <p className={`text-sm text-gray-600`}>{description}</p>
            </div>
        </div>
    </div>
);


export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center">
                    <button onClick={onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">My Safety Dashboard</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                 <div className="mb-8 text-center">
                    <button
                        onClick={() => alert('Emergency SOS Activated! (Simulation)')}
                        className="w-full md:w-auto inline-flex flex-col items-center justify-center px-12 py-6 rounded-2xl text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300 bg-gradient-to-br from-red-600 to-red-800 animate-pulse"
                        aria-label="Activate Emergency SOS"
                    >
                        <SosIcon className="w-12 h-12 mb-2" />
                        <span className="text-2xl font-bold tracking-wider">EMERGENCY SOS</span>
                        <span className="text-xs opacity-80 mt-1">Tap to Instantly Alert Contacts & Services</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SafetyFeatureCard
                        title="Emergency Health Card"
                        description="Access vital medical info offline via QR."
                        icon={<QrCodeIcon />}
                        onClick={() => alert('Feature coming soon!')}
                        className="bg-white"
                    />
                    <SafetyFeatureCard
                        title="Data & Privacy Settings"
                        description="Manage what data you share and with whom."
                        icon={<ShieldCheckIcon />}
                        onClick={() => alert('Feature coming soon!')}
                        className="bg-white"
                    />
                     <SafetyFeatureCard
                        title="Manage Emergency Contacts"
                        description="Add or update your trusted contacts."
                        icon={<UsersIcon />}
                        onClick={() => alert('Feature coming soon!')}
                        className="bg-white"
                    />
                    <SafetyFeatureCard
                        title="Secure Login (2FA)"
                        description="Enable two-factor authentication."
                        icon={<KeyIcon />}
                        onClick={() => alert('Feature coming soon!')}
                        className="bg-white"
                    />
                    <SafetyFeatureCard
                        title="Mental Health Support"
                        description="Access our 24/7 MindCare chatbot."
                        icon={<ChatBubbleHeartIcon />}
                        onClick={() => alert('Feature coming soon!')}
                        className="bg-white md:col-span-2"
                    />
                </div>
            </main>
        </div>
    );
};