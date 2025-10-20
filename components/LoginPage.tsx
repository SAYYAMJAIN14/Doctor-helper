import React, { useState } from 'react';
import { UserRole } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface LoginPageProps {
  onLogin: (username: string, role: UserRole) => void;
}

// FIX: The `icon` prop type was too generic (`React.ReactElement`), which
// caused TypeScript to fail to infer the props of the cloned element.
// By specifying `React.ReactElement<React.SVGProps<SVGSVGElement>>`,
// we inform TypeScript that the icon accepts SVG props, including `className`.
const RoleButton: React.FC<{ role: UserRole, selectedRole: UserRole | null, onSelect: (role: UserRole) => void, icon: React.ReactElement<React.SVGProps<SVGSVGElement>>, label: string }> = ({ role, selectedRole, onSelect, icon, label }) => (
    <button
        onClick={() => onSelect(role)}
        className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${selectedRole === role ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50'}`}
    >
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
        <span className="font-semibold">{label}</span>
    </button>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!selectedRole) {
      setError('Please select your role.');
      return;
    }
    setError('');
    onLogin(username, selectedRole);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">❤️ ArogyaAI</h1>
          <p className="text-gray-600 mt-2">Your AI Health Companion for Rural India</p>
        </div>

        <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">What's your name?</label>
            <input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., Priya Sharma"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Hint: Try 'Ramesh Kumar' (Patient) or 'Anjali Sharma' (Doctor).</p>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700">I am a...</label>
            <div className="flex space-x-4 mt-2">
                <RoleButton
                    role="patient"
                    selectedRole={selectedRole}
                    onSelect={setSelectedRole}
                    icon={<HeartIcon />}
                    label="Patient"
                />
                <RoleButton
                    role="doctor"
                    selectedRole={selectedRole}
                    onSelect={setSelectedRole}
                    icon={<StethoscopeIcon />}
                    label="Doctor"
                />
                 <RoleButton
                    role="admin"
                    selectedRole={selectedRole}
                    onSelect={setSelectedRole}
                    icon={<ShieldCheckIcon />}
                    label="Admin"
                />
            </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50"
          disabled={!username || !selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};