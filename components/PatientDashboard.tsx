import React, { useMemo, useState } from 'react';
import { AiSymptomChecker } from './AiSymptomChecker';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { User, Doctor, ConsultationRequest, Prescription } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

interface PatientDashboardProps {
  user: User;
  onNavigateToSafetyDashboard: () => void;
  onRequestConsultation: (patientId: string, symptomsText: string) => void;
  doctors: Doctor[];
  onBookAppointment: (patientId: string, doctorId: string, date: string, startTime: string, endTime: string) => void;
  consultationRequests: ConsultationRequest[];
  prescriptions: Prescription[];
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; onClick: () => void, className?: string }> = ({ title, description, icon, onClick, className = 'from-blue-500 to-blue-600' }) => (
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

const HealthRecordsView: React.FC<{
    consultations: ConsultationRequest[],
    prescriptions: Prescription[],
    doctors: Doctor[],
    onBack: () => void,
}> = ({ consultations, prescriptions, doctors, onBack }) => {
    const getDoctorName = (doctorId: string) => doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
              <div className="max-w-4xl mx-auto flex items-center">
                  <button onClick={onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w.3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">My Health Records</h1>
              </div>
          </header>
          <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Prescriptions</h2>
                {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                        {prescriptions.map(p => (
                            <div key={p.id} className="bg-white p-5 rounded-lg shadow-sm border">
                                <p className="font-bold text-lg text-indigo-700">Prescription from Dr. {getDoctorName(p.doctorId)}</p>
                                <p className="text-sm text-gray-500 mb-3">{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <ul className="space-y-2 mb-3">
                                    {p.medications.map((med, i) => (
                                        <li key={i} className="p-2 bg-gray-50 rounded-md">
                                            <p className="font-semibold text-gray-800">{med.name}</p>
                                            <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                                        </li>
                                    ))}
                                </ul>
                                {p.notes && <p className="text-sm text-gray-700 italic border-t pt-2 mt-2">Notes: {p.notes}</p>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 bg-white p-4 rounded-lg text-center">No prescriptions found.</p>}
            </div>
             <div>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Past Consultations</h2>
                 {consultations.length > 0 ? (
                    <div className="space-y-4">
                        {consultations.map(c => (
                            <div key={c.id} className="bg-white p-5 rounded-lg shadow-sm border">
                                <p className="font-bold text-gray-800">Consultation on {c.createdAt.toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Your Symptoms:</span> {c.symptomsText}</p>
                                {c.doctorNotes && <p className="text-sm text-gray-600 mt-2 bg-green-50 p-2 rounded-md"><span className="font-semibold">Doctor's Notes:</span> {c.doctorNotes}</p>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 bg-white p-4 rounded-lg text-center">No past consultations found.</p>}
            </div>
          </main>
        </div>
    );
};

const OrderMedicinesView: React.FC<{
    prescriptions: Prescription[],
    doctors: Doctor[],
    onBack: () => void,
}> = ({ prescriptions, doctors, onBack }) => {
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(prescriptions[0]?.id || null);
    const [selectedMeds, setSelectedMeds] = useState<Record<string, boolean>>({});
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleMedSelection = (medName: string) => {
        setSelectedMeds(prev => ({...prev, [medName]: !prev[medName]}));
    };
    
    const handlePlaceOrder = () => {
        const medsToOrder = Object.entries(selectedMeds).filter(([, isSelected]) => isSelected).length;
        if (medsToOrder > 0) {
            setOrderPlaced(true);
        } else {
            alert("Please select at least one medication to order.");
        }
    };

    const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);
    const getDoctorName = (doctorId: string) => doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
              <div className="max-w-4xl mx-auto flex items-center">
                  <button onClick={onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w.3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">Order Medicines</h1>
              </div>
          </header>
            <main className="max-w-4xl mx-auto p-4 md:p-8">
                {orderPlaced ? (
                    <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Placed!</h2>
                        <p className="text-gray-600 mt-2">Your order has been sent to the local pharmacy. You will be contacted shortly for payment and delivery details.</p>
                        <button onClick={onBack} className="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Back to Dashboard</button>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
                        <div>
                            <label htmlFor="prescription-select" className="block text-sm font-medium text-gray-700 mb-1">Select a Prescription</label>
                            <select id="prescription-select" value={selectedPrescriptionId || ''} onChange={e => setSelectedPrescriptionId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                {prescriptions.map(p => (
                                    <option key={p.id} value={p.id}>
                                        Prescription from {new Date(p.date).toLocaleDateString()} by Dr. {getDoctorName(p.doctorId)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedPrescription ? (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Medications</h3>
                                <div className="space-y-3">
                                    {selectedPrescription.medications.map((med, i) => (
                                        <label key={i} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input type="checkbox" checked={!!selectedMeds[med.name]} onChange={() => handleMedSelection(med.name)} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                            <div className="ml-4">
                                                <p className="font-semibold text-gray-900">{med.name}</p>
                                                <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={handlePlaceOrder} className="mt-6 w-full bg-rose-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-700 transition-colors">
                                    Place Order for Selected Medicines
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">You have no prescriptions to order from.</p>
                        )}
                    </div>
                )}
          </main>
        </div>
    );
};

const BookingView: React.FC<{
    user: User;
    doctors: Doctor[];
    onBookAppointment: (patientId: string, doctorId: string, date: string, startTime: string, endTime: string) => void;
    onBack: () => void;
}> = ({ user, doctors, onBookAppointment, onBack }) => {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // HH:MM

    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

    const availableDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    const generateTimeSlots = (startTimeStr: string, endTimeStr: string, bookedSlots: string[], slotDuration: number): string[] => {
        const slots: string[] = [];
        const start = new Date(`1970-01-01T${startTimeStr}:00`);
        const end = new Date(`1970-01-01T${endTimeStr}:00`);

        let current = start;
        while (current.getTime() < end.getTime()) {
            const timeString = current.toTimeString().substring(0, 5);
            if (!bookedSlots.includes(timeString)) {
                slots.push(timeString);
            }
            current.setMinutes(current.getMinutes() + slotDuration);
        }
        return slots;
    };

    const availableSlots = useMemo(() => {
        if (!selectedDoctor?.schedule || !selectedDate) return [];

        const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof selectedDoctor.schedule;
        const dayAvailability = selectedDoctor.schedule[dayOfWeek];
        
        if (!dayAvailability || !dayAvailability.isAvailable) return [];

        const dateString = selectedDate;
        const bookedSlotsForDay = (selectedDoctor.appointments || [])
            .filter(app => app.date === dateString)
            .map(app => app.startTime);
        
        return generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, bookedSlotsForDay, 30);
    }, [selectedDoctor, selectedDate]);

    const handleBooking = () => {
        if (selectedDoctorId && selectedDate && selectedSlot) {
            const startTime = selectedSlot;
            const endTimeDate = new Date(`1970-01-01T${startTime}:00`);
            endTimeDate.setMinutes(endTimeDate.getMinutes() + 30);
            const endTime = endTimeDate.toTimeString().substring(0, 5);
            onBookAppointment(user.id, selectedDoctorId, selectedDate, startTime, endTime);
            onBack();
        } else {
            alert("Please complete all steps to book an appointment.");
        }
    };

    return (
      <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
              <div className="max-w-4xl mx-auto flex items-center">
                  <button onClick={onBack} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">Book an Appointment</h1>
              </div>
          </header>
          <main className="max-w-4xl mx-auto p-4 md:p-8">
              <div className="bg-white p-6 rounded-2xl shadow-md space-y-8">
                  {/* Step 1: Select Doctor */}
                  <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">1. Select a Doctor</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {doctors.map(doctor => (
                              <div key={doctor.id} onClick={() => { setSelectedDoctorId(doctor.id); setSelectedDate(null); setSelectedSlot(null); }} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedDoctorId === doctor.id ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 hover:border-green-400'}`}>
                                  <div className="flex items-center space-x-4">
                                      <img src={`https://picsum.photos/seed/Dr.${doctor.name}/48/48`} alt={`Dr. ${doctor.name}`} className="w-12 h-12 rounded-full" />
                                      <div>
                                          <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
                                          <p className="text-sm text-gray-500">{doctor.specialty}</p>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Step 2: Select Date */}
                  {selectedDoctorId && (
                      <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">2. Select a Date</h3>
                          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                              {availableDates.map(date => {
                                  const dateString = date.toISOString().split('T')[0];
                                  return (
                                      <button key={dateString} onClick={() => { setSelectedDate(dateString); setSelectedSlot(null); }} className={`p-3 rounded-lg border-2 text-center transition-all ${selectedDate === dateString ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:border-green-400'}`}>
                                          <p className="font-bold text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                          <p className="text-2xl font-semibold">{date.getDate()}</p>
                                          <p className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</p>
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                  )}

                  {/* Step 3: Select Time Slot */}
                  {selectedDate && (
                      <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">3. Select a Time Slot</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                              {availableSlots.length > 0 ? availableSlots.map(slot => (
                                  <button key={slot} onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-lg border-2 font-semibold transition-all ${selectedSlot === slot ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:border-green-400'}`}>
                                      {slot}
                                  </button>
                              )) : (
                                  <p className="col-span-full text-center text-gray-500 p-4 bg-gray-100 rounded-lg">No available slots for this day. Please select another date.</p>
                              )}
                          </div>
                      </div>
                  )}
                  
                   {/* Step 4: Confirm Booking */}
                  {selectedSlot && (
                        <div className="pt-6 border-t">
                            <h3 className="text-xl font-bold text-gray-800">4. Confirm Your Booking</h3>
                            <div className="bg-indigo-50 p-4 rounded-lg my-4 text-indigo-800">
                                <p><span className="font-semibold">Doctor:</span> Dr. {selectedDoctor?.name}</p>
                                <p><span className="font-semibold">Date:</span> {new Date(selectedDate!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><span className="font-semibold">Time:</span> {selectedSlot}</p>
                            </div>
                            <button onClick={handleBooking} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                Confirm Appointment
                            </button>
                        </div>
                  )}
              </div>
          </main>
      </div>
    );
};


export const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onNavigateToSafetyDashboard, onRequestConsultation, doctors, onBookAppointment, consultationRequests, prescriptions }) => {
  const [view, setView] = useState<'main' | 'booking' | 'records' | 'medicines'>('main');
  
  const handleRequest = (symptomsText: string) => {
    onRequestConsultation(user.id, symptomsText);
  };
  
  if (view === 'booking') {
      return <BookingView user={user} doctors={doctors} onBookAppointment={onBookAppointment} onBack={() => setView('main')} />;
  }

  if (view === 'records') {
      return <HealthRecordsView consultations={consultationRequests} prescriptions={prescriptions} doctors={doctors} onBack={() => setView('main')} />;
  }

  if (view === 'medicines') {
      return <OrderMedicinesView prescriptions={prescriptions} doctors={doctors} onBack={() => setView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">❤️ ArogyaAI</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <img src={`https://picsum.photos/seed/${user.name}/40/40`} alt="User profile" className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">How are you feeling today, {user.name}?</h2>
          <p className="text-gray-600 mt-1">Get an instant preliminary analysis of your symptoms.</p>
        </div>

        <div className="mb-8">
          <AiSymptomChecker onRequestConsultation={handleRequest} />
        </div>
        
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Other Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    title="Book Appointment"
                    description="Schedule a video call with a specialist."
                    icon={<ClipboardListIcon className="w-10 h-10" />}
                    onClick={() => setView('booking')}
                    className="from-green-500 to-emerald-600"
                />
                <FeatureCard
                    title="My Health Records"
                    description="View your past reports and prescriptions."
                    icon={<SparklesIcon className="w-10 h-10" />}
                    onClick={() => setView('records')}
                    className="from-purple-500 to-indigo-600"
                />
                 <FeatureCard
                    title="Order Medicines"
                    description="Get prescribed medicines delivered to your doorstep."
                    icon={<CreditCardIcon className="w-10 h-10" />}
                    onClick={() => setView('medicines')}
                    className="from-rose-500 to-red-600"
                />
                 <FeatureCard
                    title="My Safety & Security"
                    description="Manage emergency contacts, data privacy, and more."
                    icon={<ShieldCheckIcon className="w-10 h-10" />}
                    onClick={onNavigateToSafetyDashboard}
                    className="from-slate-600 to-gray-800"
                />
            </div>
        </div>

      </main>
    </div>
  );
};