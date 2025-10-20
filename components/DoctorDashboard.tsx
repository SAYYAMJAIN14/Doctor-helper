// FIX: Implemented the DoctorDashboard component to provide doctors with functionalities to manage consultations, schedules, and prescriptions.
import React, { useState, useMemo } from 'react';
import { Doctor, Patient, ConsultationRequest, DoctorSchedule, Appointment, Prescription, Medication } from '../types';
import { suggestMedications } from '../services/geminiService';

// Icons
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BrainIcon } from './icons/BrainIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

// Prop types
interface DoctorDashboardProps {
    user: Doctor;
    patients: Patient[];
    consultationRequests: ConsultationRequest[];
    onUpdateNotes: (requestId: string, notes: string) => void;
    onUpdateSchedule: (doctorId: string, newSchedule: DoctorSchedule) => void;
    appointments: Appointment[];
    onAddPrescription: (prescription: Omit<Prescription, 'id'>) => void;
    prescriptions: Prescription[];
}

// Sub-component for managing the schedule
const ScheduleModal: React.FC<{
    currentSchedule: DoctorSchedule;
    onClose: () => void;
    onSave: (newSchedule: DoctorSchedule) => void;
}> = ({ currentSchedule, onClose, onSave }) => {
    const [schedule, setSchedule] = useState<DoctorSchedule>(currentSchedule);

    const handleAvailabilityChange = (day: keyof DoctorSchedule, isAvailable: boolean) => {
        setSchedule(prev => ({ ...prev, [day]: { ...prev[day], isAvailable } }));
    };

    const handleTimeChange = (day: keyof DoctorSchedule, timeType: 'startTime' | 'endTime', value: string) => {
        setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [timeType]: value } }));
    };

    const weekDays: (keyof DoctorSchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Weekly Schedule</h2>
                <div className="space-y-4">
                    {weekDays.map(day => (
                        <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`available-${day}`}
                                    checked={schedule[day].isAvailable}
                                    onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                                    className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`available-${day}`} className="ml-3 font-semibold capitalize text-gray-700">{day}</label>
                            </div>
                            <div className="flex items-center space-x-2 col-span-2">
                                <label htmlFor={`start-${day}`} className="text-sm text-gray-500">From:</label>
                                <input
                                    type="time"
                                    id={`start-${day}`}
                                    value={schedule[day].startTime}
                                    onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                    disabled={!schedule[day].isAvailable}
                                    className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-200"
                                />
                                <label htmlFor={`end-${day}`} className="text-sm text-gray-500">To:</label>
                                <input
                                    type="time"
                                    id={`end-${day}`}
                                    value={schedule[day].endTime}
                                    onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                    disabled={!schedule[day].isAvailable}
                                    className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-200"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(schedule); onClose(); }} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// Sub-component for viewing a consultation and creating a prescription
const ConsultationModal: React.FC<{
    request: ConsultationRequest;
    patient: Patient | undefined;
    onClose: () => void;
    onAddPrescription: (prescription: Omit<Prescription, 'id'>) => void;
    onUpdateNotes: (requestId: string, notes: string) => void;
    doctorId: string;
}> = ({ request, patient, onClose, onAddPrescription, onUpdateNotes, doctorId }) => {
    const [doctorNotes, setDoctorNotes] = useState(request.doctorNotes || '');
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isSuggestingMeds, setIsSuggestingMeds] = useState(false);

    const handleSuggestMeds = async () => {
        setIsSuggestingMeds(true);
        try {
            const result = await suggestMedications(request.symptomsText);
            setMedications(result.medications);
        } catch (error) {
            alert('Failed to get AI suggestions. Please add medications manually.');
        } finally {
            setIsSuggestingMeds(false);
        }
    };

    const handleAddMedicationRow = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
    };

    const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handleSave = () => {
        onUpdateNotes(request.id, doctorNotes);
        if (medications.length > 0 && medications.some(m => m.name.trim())) {
            const validMeds = medications.filter(m => m.name.trim());
            const newPrescription: Omit<Prescription, 'id'> = {
                patientId: request.patientId,
                doctorId: doctorId,
                consultationRequestId: request.id,
                date: new Date().toISOString().split('T')[0],
                medications: validMeds,
                notes: doctorNotes,
            };
            onAddPrescription(newPrescription);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Consultation Details</h2>
                <p className="text-sm text-gray-500 mb-6">Request from: <span className="font-semibold">{patient?.name || 'Unknown Patient'}</span></p>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Patient's Symptoms</h3>
                        <p className="bg-gray-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">{request.symptomsText}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Your Notes</h3>
                        <textarea
                            rows={4}
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Add your diagnosis, advice, and other notes here..."
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-700">Prescription</h3>
                            <button onClick={handleSuggestMeds} disabled={isSuggestingMeds} className="flex items-center space-x-2 text-sm bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50">
                                <BrainIcon className="w-5 h-5" />
                                <span>{isSuggestingMeds ? 'Thinking...' : 'Suggest with AI'}</span>
                            </button>
                        </div>
                        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                            {medications.map((med, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Medication Name" value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} className="col-span-3 sm:col-span-1 p-2 border border-gray-300 rounded-md" />
                                    <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => handleMedicationChange(index, 'dosage', e.target.value)} className="p-2 border border-gray-300 rounded-md" />
                                    <input type="text" placeholder="Frequency (e.g., Twice a day)" value={med.frequency} onChange={e => handleMedicationChange(index, 'frequency', e.target.value)} className="p-2 border border-gray-300 rounded-md" />
                                </div>
                            ))}
                            <button onClick={handleAddMedicationRow} className="flex items-center space-x-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Medication</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">Save & Mark as Reviewed</button>
                </div>
            </div>
        </div>
    );
};

const PatientRecordsView: React.FC<{
    patients: Patient[];
    consultations: ConsultationRequest[];
    appointments: Appointment[];
    prescriptions: Prescription[];
    onBack: () => void;
}> = ({ patients, consultations, appointments, prescriptions, onBack }) => {
    const [search, setSearch] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const filteredPatients = useMemo(() => {
        if (!search) return patients;
        const lcSearch = search.toLowerCase();
        return patients.filter(p => p.name.toLowerCase().includes(lcSearch) || p.id.toLowerCase().includes(lcSearch));
    }, [search, patients]);
    
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const patientTimeline = useMemo(() => {
        if (!selectedPatient) return [];
        
        type TimelineEvent = 
            | { type: 'consultation', date: Date, data: ConsultationRequest }
            | { type: 'appointment', date: Date, data: Appointment }
            | { type: 'prescription', date: Date, data: Prescription };

        const patientConsultations: TimelineEvent[] = consultations
            .filter(c => c.patientId === selectedPatient.id)
            .map(c => ({ type: 'consultation', date: c.createdAt, data: c }));

        const patientAppointments: TimelineEvent[] = appointments
            .filter(a => a.patientId === selectedPatient.id)
            .map(a => ({ type: 'appointment', date: new Date(`${a.date}T${a.startTime}`), data: a }));
            
        const patientPrescriptions: TimelineEvent[] = prescriptions
            .filter(p => p.patientId === selectedPatient.id)
            .map(p => ({ type: 'prescription', date: new Date(p.date), data: p }));

        const timeline = [...patientConsultations, ...patientAppointments, ...patientPrescriptions];
        timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
        return timeline;
    }, [selectedPatientId, consultations, appointments, prescriptions]);

    const TimelineIcon: React.FC<{type: string}> = ({type}) => {
        const iconMap: Record<string, React.ReactElement> = {
            appointment: <CalendarDaysIcon className="w-5 h-5 text-blue-600" />,
            consultation: <ChatBubbleLeftRightIcon className="w-5 h-5 text-red-600" />,
            prescription: <PencilSquareIcon className="w-5 h-5 text-green-600" />,
        };
        return <div className="absolute w-10 h-10 bg-gray-200 rounded-full mt-1.5 -start-5 border-4 border-white flex items-center justify-center">{iconMap[type]}</div>
    };

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex items-center">
                    <button onClick={selectedPatientId ? () => setSelectedPatientId(null) : onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedPatient ? `History for ${selectedPatient.name}` : 'Patient Records'}</h1>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-4 md:p-8">
                {selectedPatient ? (
                     <ol className="relative border-s border-gray-200 ml-5">
                         {patientTimeline.map((item, index) => (
                             <li key={index} className="mb-10 ms-12">
                                 <TimelineIcon type={item.type}/>
                                 <h3 className="text-lg font-semibold text-gray-900 capitalize">{item.type}</h3>
                                 <time className="block mb-2 text-sm font-normal leading-none text-gray-400">{item.date.toLocaleString()}</time>
                                 {item.type === 'appointment' && (
                                     <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                         <p>Status: <span className="font-semibold capitalize">{item.data.status}</span></p>
                                         <p>Time: {item.data.startTime} - {item.data.endTime}</p>
                                     </div>
                                 )}
                                 {item.type === 'consultation' && (
                                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                                         <p><span className="font-semibold">Symptoms:</span> {(item.data as ConsultationRequest).symptomsText}</p>
                                         {(item.data as ConsultationRequest).doctorNotes && <p><span className="font-semibold">Notes:</span> {(item.data as ConsultationRequest).doctorNotes}</p>}
                                     </div>
                                 )}
                                  {item.type === 'prescription' && (
                                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                         <ul className="space-y-1">
                                             {(item.data as Prescription).medications.map((med, i) => (
                                                 <li key={i}><strong>{med.name}</strong> - {med.dosage}, {med.frequency}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                             </li>
                         ))}
                         {patientTimeline.length === 0 && <p className="text-gray-500">No records found for this patient.</p>}
                     </ol>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <div className="relative mb-4">
                            <input type="text" placeholder="Search patients by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {filteredPatients.map(patient => (
                                <li key={patient.id} onClick={() => setSelectedPatientId(patient.id)} className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{patient.name}</p>
                                        <p className="text-sm text-gray-500">ID: {patient.id}</p>
                                    </div>
                                    <p className="text-sm text-gray-600">{patient.phone}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, patients, consultationRequests, onUpdateNotes, onUpdateSchedule, appointments, onAddPrescription, prescriptions }) => {
    const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [view, setView] = useState<'dashboard' | 'records'>('dashboard');

    const pendingRequests = useMemo(() => consultationRequests.filter(r => r.status === 'pending'), [consultationRequests]);
    const upcomingAppointments = useMemo(() => {
        const now = new Date();
        return appointments
            .filter(app => new Date(`${app.date}T${app.startTime}`) >= now)
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
    }, [appointments]);

    const getPatientName = (patientId: string) => patients.find(p => p.id === patientId)?.name || 'Unknown Patient';

    const handleSaveSchedule = (newSchedule: DoctorSchedule) => {
        onUpdateSchedule(user.id, newSchedule);
    };

    if (view === 'records') {
        return <PatientRecordsView 
            patients={patients}
            consultations={consultationRequests}
            appointments={appointments}
            prescriptions={prescriptions}
            onBack={() => setView('dashboard')}
        />
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-teal-600">🩺 ArogyaAI Doctor Portal</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 hidden sm:inline">Welcome, Dr. {user.name}</span>
                        <img src={`https://picsum.photos/seed/Dr.${user.name}/40/40`} alt="User profile" className="w-10 h-10 rounded-full" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4 col-span-1 lg:col-span-1">
                        <div className="p-3 bg-red-100 rounded-full">
                            <ChatBubbleLeftRightIcon className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">{pendingRequests.length}</p>
                            <p className="text-gray-500">Pending Consultations</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4 col-span-1 lg:col-span-1">
                         <div className="p-3 bg-blue-100 rounded-full">
                            <CalendarDaysIcon className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">{upcomingAppointments.length}</p>
                            <p className="text-gray-500">Upcoming Appointments</p>
                        </div>
                    </div>
                    <button onClick={() => setIsScheduleModalOpen(true)} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4 text-left hover:bg-gray-50 transition-colors col-span-1 md:col-span-1 lg:col-span-1">
                         <div className="p-3 bg-green-100 rounded-full">
                            <PencilSquareIcon className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-800">Manage Schedule</p>
                            <p className="text-sm text-gray-500">Update your availability</p>
                        </div>
                    </button>
                    <button onClick={() => setView('records')} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4 text-left hover:bg-gray-50 transition-colors col-span-1 md:col-span-1 lg:col-span-1">
                         <div className="p-3 bg-indigo-100 rounded-full">
                            <DocumentTextIcon className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-800">Patient Records</p>
                            <p className="text-sm text-gray-500">Search patient history</p>
                        </div>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Consultations */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Consultation Requests</h2>
                        <div className="bg-white p-4 rounded-2xl shadow-md space-y-3 max-h-[60vh] overflow-y-auto">
                            {pendingRequests.length > 0 ? pendingRequests.map(req => (
                                <div key={req.id} className="p-4 border rounded-lg hover:bg-indigo-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{getPatientName(req.patientId)}</p>
                                            <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">{req.symptomsText}</p>
                                        </div>
                                        <button onClick={() => setSelectedRequest(req)} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">View</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-8">No pending requests. Well done!</p>
                            )}
                        </div>
                    </div>
                    {/* Upcoming Appointments */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
                        <div className="bg-white p-4 rounded-2xl shadow-md space-y-3 max-h-[60vh] overflow-y-auto">
                             {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                                <div key={app.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{getPatientName(app.patientId)}</p>
                                            <p className="text-sm text-gray-600 font-semibold">{new Date(`${app.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-teal-600">{app.startTime} - {app.endTime}</p>
                                            <p className="text-xs text-gray-500">Video Call</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-8">You have no upcoming appointments.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {selectedRequest && (
                <ConsultationModal 
                    request={selectedRequest}
                    patient={patients.find(p => p.id === selectedRequest.patientId)}
                    onClose={() => setSelectedRequest(null)}
                    onAddPrescription={onAddPrescription}
                    onUpdateNotes={onUpdateNotes}
                    doctorId={user.id}
                />
            )}
            {isScheduleModalOpen && user.schedule && (
                <ScheduleModal
                    currentSchedule={user.schedule}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSave={handleSaveSchedule}
                />
            )}
        </div>
    );
};