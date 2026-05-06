import React, { useState } from 'react';
import { Search, Filter, AlertCircle, ChevronRight, Phone, Video, FileText, MoreVertical } from 'lucide-react';
import { MOCK_PATIENTS } from '../constants';
import { PatientRisk } from '../types';
import BottomSheet from './BottomSheet';

interface PatientQueueProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientQueue: React.FC<PatientQueueProps> = ({ onSelectPatient }) => {
  const [selectedForAction, setSelectedForAction] = useState<string | null>(null);

  const getRiskColor = (risk: PatientRisk) => {
    switch (risk) {
      case PatientRisk.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case PatientRisk.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case PatientRisk.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case PatientRisk.LOW: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const activePatient = MOCK_PATIENTS.find(p => p.id === selectedForAction);

  return (
    <div className="flex flex-col bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Patient Queue</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Risk-prioritized list</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
            <Filter className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {/* Mobile Card View (Now Default) */}
        <div className="divide-y divide-zinc-100">
          {MOCK_PATIENTS.map((patient) => (
            <div 
              key={patient.id} 
              className="p-4 active:bg-zinc-50 transition-colors flex items-center justify-between"
            >
              <div 
                className="flex items-center gap-3 flex-1"
                onClick={() => onSelectPatient(patient.id)}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 text-lg">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-900">{patient.name}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black border ${getRiskColor(patient.riskLevel)}`}>
                      {patient.riskLevel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {patient.programs.map(p => (
                      <span key={p} className="px-1 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[8px] font-bold uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                  {patient.rpmAlerts && (
                    <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {patient.rpmAlerts} RPM Alerts
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedForAction(patient.id)}
                className="p-2 text-zinc-400"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Actions Bottom Sheet */}
      <BottomSheet 
        isOpen={!!selectedForAction} 
        onClose={() => setSelectedForAction(null)}
        title={activePatient?.name || 'Patient Actions'}
      >
        <button 
          onClick={() => {
            if (selectedForAction) onSelectPatient(selectedForAction);
            setSelectedForAction(null);
          }}
          className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl text-zinc-900 font-bold"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          View Full Profile
        </button>
        <button className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl text-zinc-900 font-bold">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Video className="w-5 h-5 text-emerald-500" />
          </div>
          Start Telehealth Visit
        </button>
        <button className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl text-zinc-900 font-bold">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Phone className="w-5 h-5 text-emerald-500" />
          </div>
          Voice Call
        </button>
      </BottomSheet>
    </div>
  );
};

export default PatientQueue;
