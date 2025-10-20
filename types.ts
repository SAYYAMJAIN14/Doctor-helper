// FIX: Implemented full type definitions for the application.
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Patient extends User {
  role: 'patient';
  phone: string;
}

export interface DayAvailability {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export type DoctorSchedule = Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', DayAvailability>;

export type AppointmentStatus = 'booked' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: AppointmentStatus;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  schedule?: DoctorSchedule;
  appointments?: Appointment[];
}

export interface Admin extends User {
    role: 'admin';
}

export type AppUser = Patient | Doctor | Admin;

export interface ConsultationRequest {
    id: string;
    patientId: string;
    symptomsText: string;
    status: 'pending' | 'reviewed';
    doctorNotes: string;
    createdAt: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id:string;
  patientId: string;
  doctorId: string;
  consultationRequestId: string;
  date: string; // YYYY-MM-DD
  medications: Medication[];
  notes: string;
}