import React, { useState } from 'react';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { Patient, Doctor } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface AdminDashboardProps {
    adminName: string;
    patients: Patient[];
    doctors: Doctor[];
    onAddPatient: (name: string, phone: string) => void;
    onAddDoctor: (name: string, specialty: string) => void;
}

const AdminFeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; onClick?: () => void; className?: string }> = ({ title, description, icon, onClick, className = 'from-gray-700 to-gray-800' }) => (
    <div
        onClick={onClick}
        className={`relative p-6 rounded-2xl text-white shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-br ${className}`}
    >
        <div className="relative z-10">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm opacity-90 mt-1">{description}</p>
        </div>
         <div className="absolute -bottom-4 -right-4 text-white/20">
            {React.cloneElement(icon, { className: 'w-24 h-24' })}
        </div>
    </div>
);

const UserManagementView: React.FC<{
    patients: Patient[];
    doctors: Doctor[];
    onAddPatient: (name: string, phone: string) => void;
    onAddDoctor: (name: string, specialty: string) => void;
    onBack: () => void;
}> = ({ patients, doctors, onAddPatient, onAddDoctor, onBack }) => {
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorSpecialty, setDoctorSpecialty] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [doctorSearch, setDoctorSearch] = useState('');

    const handleAddPatientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (patientName.trim() && patientPhone.trim()) {
            onAddPatient(patientName, patientPhone);
            setPatientName('');
            setPatientPhone('');
        }
    };

    const handleAddDoctorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (doctorName.trim() && doctorSpecialty.trim()) {
            onAddDoctor(doctorName, doctorSpecialty);
            setDoctorName('');
            setDoctorSpecialty('');
        }
    };

    const lcPatientSearch = patientSearch.toLowerCase();
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(lcPatientSearch) ||
        p.phone.includes(patientSearch) ||
        p.id.toLowerCase().includes(lcPatientSearch)
    );

    const lcDoctorSearch = doctorSearch.toLowerCase();
    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(lcDoctorSearch) ||
        d.specialty.toLowerCase().includes(lcDoctorSearch) ||
        d.id.toLowerCase().includes(lcDoctorSearch)
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex items-center">
                    <button onClick={onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                </div>
            </header>
             <main className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Patients Column */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800">Manage Patients</h3>
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h4 className="text-lg font-semibold mb-3 text-gray-700">Add New Patient</h4>
                            <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                                <input type="text" placeholder="Patient Name" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                <input type="tel" placeholder="Phone Number" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Add Patient</button>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h4 className="text-lg font-semibold mb-4 text-gray-700">Existing Patients ({filteredPatients.length})</h4>
                            <div className="relative mb-4">
                                <input type="text" placeholder="Search by name, phone, or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                           <ul className="space-y-3 max-h-80 overflow-y-auto">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map(p => (
                                    <li key={p.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center flex-wrap">
                                        <div>
                                            <div className="font-medium text-gray-800">{p.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">ID: {p.id}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{p.phone}</div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-gray-500 py-4">No patients found.</li>
                            )}
                           </ul>
                        </div>
                    </div>
                    {/* Doctors Column */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800">Manage Doctors</h3>
                         <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h4 className="text-lg font-semibold mb-3 text-gray-700">Add New Doctor</h4>
                            <form onSubmit={handleAddDoctorSubmit} className="space-y-4">
                                <input type="text" placeholder="Doctor Name" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                                <input type="text" placeholder="Specialty" value={doctorSpecialty} onChange={e => setDoctorSpecialty(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors">Add Doctor</button>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                           <h4 className="text-lg font-semibold mb-4 text-gray-700">Existing Doctors ({filteredDoctors.length})</h4>
                           <div className="relative mb-4">
                                <input type="text" placeholder="Search by name, specialty, or ID..." value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                           <ul className="space-y-3 max-h-80 overflow-y-auto">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map(d => (
                                    <li key={d.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center flex-wrap">
                                        <div>
                                            <div className="font-medium text-gray-800">Dr. {d.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">ID: {d.id}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{d.specialty}</div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-gray-500 py-4">No doctors found.</li>
                            )}
                           </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminName, patients, doctors, onAddPatient, onAddDoctor }) => {
    const [view, setView] = useState<'main' | 'userManagement'>('main');

    if (view === 'userManagement') {
        return <UserManagementView 
            patients={patients}
            doctors={doctors}
            onAddPatient={onAddPatient}
            onAddDoctor={onAddDoctor}
            onBack={() => setView('main')}
        />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-700">🛡️ ArogyaAI Admin Panel</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Admin: {adminName}</span>
                         <img src={`https://picsum.photos/seed/Admin${adminName}/40/40`} alt="Admin profile" className="w-10 h-10 rounded-full" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome, {adminName}.</h2>
                    <p className="text-gray-600 mt-1">System status is <span className="font-bold text-green-600">All Systems Operational</span>.</p>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AdminFeatureCard
                        title="User Management"
                        description="View & manage patients and doctors."
                        icon={<UserGroupIcon className="w-10 h-10" />}
                        onClick={() => setView('userManagement')}
                        className="from-blue-500 to-indigo-600"
                    />
                     <AdminFeatureCard
                        title="Consultation Monitoring"
                        description="Review ongoing and past video consultations."
                        icon={<VideoCameraIcon className="w-10 h-10" />}
                        onClick={() => alert('Feature coming soon!')}
                        className="from-sky-500 to-cyan-500"
                    />
                    <AdminFeatureCard
                        title="Platform Analytics"
                        description="Track user growth, engagement, and AI usage."
                        icon={<ChartBarIcon className="w-10 h-10" />}
                        onClick={() => alert('Feature coming soon!')}
                        className="from-emerald-500 to-green-600"
                    />
                     <AdminFeatureCard
                        title="AI Model Management"
                        description="A/B test prompts and model versions."
                        icon={<BeakerIcon className="w-10 h-10" />}
                        onClick={() => alert('Feature coming soon!')}
                        className="from-purple-500 to-violet-600"
                    />
                     <AdminFeatureCard
                        title="System Alerts"
                        description="View critical system errors and alerts."
                        icon={<ExclamationTriangleIcon className="w-10 h-10" />}
                        onClick={() => alert('Feature coming soon!')}
                        className="from-amber-500 to-orange-600"
                    />
                </div>
            </main>
        </div>
    );
};