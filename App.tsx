// FIX: Implemented the main App component to manage state and routing.
import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SafetyDashboard } from './components/SafetyDashboard';
import { AppUser, UserRole, Patient, Doctor, ConsultationRequest, DoctorSchedule, Appointment, Prescription } from './types';

// Mock Data
const defaultSchedule: DoctorSchedule = {
    monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { isAvailable: true, startTime: '09:00', endTime: '13:00' },
    thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
    sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
};


const initialPatients: Patient[] = [
    { id: 'p1', name: 'Ramesh Kumar', role: 'patient', phone: '9876543210' },
    { id: 'p2', name: 'Sunita Devi', role: 'patient', phone: '8765432109' },
];

const initialDoctors: Doctor[] = [
    { id: 'd1', name: 'Anjali Sharma', role: 'doctor', specialty: 'General Physician', schedule: defaultSchedule, appointments: [] },
    { id: 'd2', name: 'Vikram Singh', role: 'doctor', specialty: 'Cardiologist', schedule: { ...defaultSchedule, wednesday: { isAvailable: false, startTime: '09:00', endTime: '17:00' } }, appointments: [] },
];

const initialRequests: ConsultationRequest[] = [
    {
        id: 'req1',
        patientId: 'p1',
        symptomsText: "I've had a persistent dry cough and a slight fever for the past two days. I also feel very tired.",
        status: 'pending',
        doctorNotes: '',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
        id: 'req2',
        patientId: 'p2',
        symptomsText: 'I have a rash on my arm. It is red, itchy, and has small bumps. I have attached a photo.',
        status: 'reviewed',
        doctorNotes: 'Looks like a mild allergic reaction. I recommend applying a hydrocortisone cream twice a day. If it does not improve in 3 days, please schedule a video call.',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
    }
];

const initialPrescriptions: Prescription[] = [
    {
        id: 'presc1',
        patientId: 'p2',
        doctorId: 'd1',
        consultationRequestId: 'req2',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        medications: [
            { name: 'Hydrocortisone Cream 1%', dosage: 'Apply thin layer', frequency: 'Twice a day for 3 days' }
        ],
        notes: "Apply to the affected area. If the rash worsens or does not improve, please book a follow-up appointment."
    }
];

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'safety'>('login');
    
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(initialRequests);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
    
    const handleLogin = (username: string, role: UserRole) => {
        // Simple mock login: find user by name and role, or create a new one.
        const lcUsername = username.toLowerCase();
        let user: AppUser | undefined;

        if (role === 'patient') {
            user = patients.find(p => p.name.toLowerCase() === lcUsername);
            if (!user) {
                const newPatient: Patient = { id: `p${patients.length + 1}`, name: username, role: 'patient', phone: 'N/A' };
                setPatients(prev => [...prev, newPatient]);
                user = newPatient;
            }
        } else if (role === 'doctor') {
            user = doctors.find(d => d.name.toLowerCase() === lcUsername);
             if (!user) {
                 const newDoctor: Doctor = { id: `d${doctors.length + 1}`, name: username, role: 'doctor', specialty: 'General', schedule: defaultSchedule, appointments: [] };
                 setDoctors(prev => [...prev, newDoctor]);
                 user = newDoctor;
             }
        } else { // admin
            user = { id: 'admin1', name: username, role: 'admin' };
        }
        
        setCurrentUser(user as AppUser);
        setCurrentView('dashboard');
    };

    const handleRequestConsultation = (patientId: string, symptomsText: string) => {
        const newRequest: ConsultationRequest = {
            id: `req${consultationRequests.length + 1}`,
            patientId,
            symptomsText,
            status: 'pending',
            doctorNotes: '',
            createdAt: new Date(),
        };
        setConsultationRequests(prev => [newRequest, ...prev]);
    };
    
    const handleUpdateNotes = (requestId: string, notes: string) => {
        setConsultationRequests(prev =>
            prev.map(req =>
                req.id === requestId ? { ...req, doctorNotes: notes, status: 'reviewed' } : req
            )
        );
    };

    const handleUpdateDoctorSchedule = (doctorId: string, newSchedule: DoctorSchedule) => {
        setDoctors(prevDoctors => 
            prevDoctors.map(doc => 
                doc.id === doctorId ? { ...doc, schedule: newSchedule } : doc
            )
        );
        // Also update currentUser if they are the one being edited
        if (currentUser?.id === doctorId) {
            setCurrentUser(prevUser => ({ ...prevUser, schedule: newSchedule }) as Doctor);
        }
    };

     const handleBookAppointment = (patientId: string, doctorId: string, date: string, startTime: string, endTime: string) => {
        const newAppointment: Appointment = {
            id: `app${appointments.length + 1}`,
            patientId,
            doctorId,
            date,
            startTime,
            endTime,
            status: 'booked',
        };

        // Update global list
        setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()));

        // Update doctor-specific list
        setDoctors(prevDoctors =>
            prevDoctors.map(doc =>
                doc.id === doctorId
                    ? { ...doc, appointments: [...(doc.appointments || []), newAppointment] }
                    : doc
            )
        );

        alert(`Appointment booked with Dr. ${doctors.find(d => d.id === doctorId)?.name} on ${new Date(date).toLocaleDateString()} at ${startTime}!`);
    };

    const handleAddPrescription = (prescription: Omit<Prescription, 'id'>) => {
        const newPrescription: Prescription = {
            id: `presc${prescriptions.length + 1}`,
            ...prescription
        };
        setPrescriptions(prev => [newPrescription, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        alert('Prescription saved successfully!');
    };

    const handleAddPatient = (name: string, phone: string) => {
         const newPatient: Patient = { id: `p${patients.length + 1}`, name, role: 'patient', phone };
         setPatients(prev => [...prev, newPatient]);
    };

    const handleAddDoctor = (name: string, specialty: string) => {
        const newDoctor: Doctor = { id: `d${doctors.length + 1}`, name, role: 'doctor', specialty, schedule: defaultSchedule };
        setDoctors(prev => [...prev, newDoctor]);
    };

    const renderContent = () => {
        if (currentView === 'login' || !currentUser) {
            return <LoginPage onLogin={handleLogin} />;
        }

        if (currentView === 'safety') {
            return <SafetyDashboard onBack={() => setCurrentView('dashboard')} />;
        }

        switch (currentUser.role) {
            case 'patient':
                return <PatientDashboard 
                            user={currentUser} 
                            onNavigateToSafetyDashboard={() => setCurrentView('safety')}
                            onRequestConsultation={handleRequestConsultation}
                            doctors={doctors}
                            onBookAppointment={handleBookAppointment}
                            consultationRequests={consultationRequests.filter(req => req.patientId === currentUser.id)}
                            prescriptions={prescriptions.filter(p => p.patientId === currentUser.id)}
                        />;
            case 'doctor':
                return <DoctorDashboard 
                            user={currentUser} 
                            patients={patients}
                            consultationRequests={consultationRequests}
                            onUpdateNotes={handleUpdateNotes}
                            onUpdateSchedule={handleUpdateDoctorSchedule}
                            appointments={appointments.filter(app => app.doctorId === currentUser.id)}
                            onAddPrescription={handleAddPrescription}
                            prescriptions={prescriptions}
                        />;
            case 'admin':
                return <AdminDashboard 
                            adminName={currentUser.name} 
                            patients={patients}
                            doctors={doctors}
                            onAddPatient={handleAddPatient}
                            onAddDoctor={handleAddDoctor}
                        />;
            default:
                return <LoginPage onLogin={handleLogin} />;
        }
    };

    return (
        <>
            {renderContent()}
        </>
    );
};

export default App;