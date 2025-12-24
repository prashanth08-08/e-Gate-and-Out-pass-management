import React, { useState } from 'react';
import { PassType, User } from '../types';
import { polishReason } from '../services/geminiService';
import { X, Sparkles, Loader2, Send } from 'lucide-react';

interface CreatePassModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreatePassModal: React.FC<CreatePassModalProps> = ({ user, onClose, onSubmit }) => {
  const [type, setType] = useState<PassType>(PassType.OUT_PASS);
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolish = async () => {
    if (!reason) return;
    setIsPolishing(true);
    const polished = await polishReason(reason);
    setReason(polished);
    setIsPolishing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      destination,
      reason,
      departureDate,
      returnDate
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">New Pass Request</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Toggle Type */}
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`py-2 text-sm font-medium rounded-md transition-all ${type === PassType.OUT_PASS ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              onClick={() => setType(PassType.OUT_PASS)}
            >
              Out Pass
            </button>
            <button
              type="button"
              className={`py-2 text-sm font-medium rounded-md transition-all ${type === PassType.GATE_PASS ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
              onClick={() => setType(PassType.GATE_PASS)}
            >
              Gate Pass
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
            <input
              required
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={type === PassType.GATE_PASS ? "e.g., Home, Mumbai" : "e.g., City Mall"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Departure</label>
              <input
                required
                type={type === PassType.GATE_PASS ? "date" : "datetime-local"}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Return</label>
              <input
                required
                type={type === PassType.GATE_PASS ? "date" : "datetime-local"}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-700">Reason</label>
              <button
                type="button"
                onClick={handlePolish}
                disabled={!reason || isPolishing}
                className="text-xs flex items-center text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                {isPolishing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                AI Polish
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Need to buy books"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <Send className="w-4 h-4 mr-2" /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePassModal;