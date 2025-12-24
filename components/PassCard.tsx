import React from 'react';
import { PassRequest, PassStatus, PassType } from '../types';
import { CheckCircle, Clock, MapPin, Calendar, QrCode, XCircle, User, FileText, ShieldCheck } from 'lucide-react';

interface PassCardProps {
  request: PassRequest;
  isWarden?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const PassCard: React.FC<PassCardProps> = ({ request, isWarden, onApprove, onReject }) => {
  const isApproved = request.status === PassStatus.APPROVED;
  const isRejected = request.status === PassStatus.REJECTED;

  // Formatting dates
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isApproved ? 'border-green-200 bg-green-50' : isRejected ? 'border-red-200 bg-red-50' : 'border-gray-200'} p-5 mb-4 transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            request.type === PassType.GATE_PASS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {request.type === PassType.GATE_PASS ? 'Gate Pass (Home/Village)' : 'Out Pass (Local)'}
          </span>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{request.studentName}</h3>
          <p className="text-sm text-gray-500">Room: {request.roomNumber}</p>
        </div>
        
        {isApproved && (
          <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <QrCode className="w-10 h-10 text-gray-800" />
            <span className="text-[10px] font-bold text-gray-600 mt-1">SCAN ME</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{request.destination}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(request.departureDate)} - {request.type === PassType.GATE_PASS ? formatDate(request.returnDate) : formatTime(request.returnDate)}</span>
        </div>
      </div>

      <div className="bg-white/60 p-3 rounded-md mb-4 border border-gray-100">
        <div className="flex items-start">
          <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
          <p className="text-sm text-gray-700 italic">"{request.reason}"</p>
        </div>
        {isWarden && request.aiSummary && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-indigo-600 flex items-center">
             <span className="font-semibold mr-1">AI Insight:</span> {JSON.parse(request.aiSummary).summary} 
             <span className={`ml-auto font-bold ${JSON.parse(request.aiSummary).risk === 'High' ? 'text-red-500' : 'text-green-500'}`}>
               Risk: {JSON.parse(request.aiSummary).risk}
             </span>
          </div>
        )}
      </div>

      {/* 3-Signature Digital Tracker */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Digital Approvals</p>
        <div className="flex items-center justify-between relative">
           {/* Line connecting steps */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.approvalFlow.mentor ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 text-gray-500">Mentor</span>
          </div>
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.approvalFlow.warden ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 text-gray-500">Warden</span>
          </div>
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.approvalFlow.chiefWarden ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 text-gray-500">Security</span>
          </div>
        </div>
      </div>

      {isWarden && request.status === PassStatus.PENDING && (
        <div className="flex space-x-3 mt-4">
          <button 
            onClick={() => onApprove && onApprove(request.id)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Approve
          </button>
          <button 
            onClick={() => onReject && onReject(request.id)}
            className="flex-1 bg-white text-red-600 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <XCircle className="w-4 h-4 mr-2" /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default PassCard;