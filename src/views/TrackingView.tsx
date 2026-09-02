import { useState } from 'react';
import type { Ticket } from '../types';
import { Search, CheckCircle, Clock, Wrench, Package } from 'lucide-react';

interface Props {
  tickets: Ticket[];
}

export function TrackingView({ tickets }: Props) {
  const [codigo, setCodigo] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<Ticket | null | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = tickets.find(t => t.id.toLowerCase() === codigo.toLowerCase().trim());
    setSearchedTicket(found || null);
  };

  const getStepNumber = (estado: string) => {
    switch(estado) {
      case 'Ingresado': return 1;
      case 'Diagnosticando': return 2;
      case 'En Reparación': return 3;
      case 'En Espera (Repuesto)': return 3;
      case 'Listo p/ Entrega': return 4;
      case 'Entregado': return 5;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 p-4">
      {/* Fake Mobile Frame or standalone view */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="bg-brand-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">DiagTech</h1>
          <p className="text-brand-100 mt-2 text-sm">Portal de Seguimiento de Equipos</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingresa tu número de Ticket (Ej. TK-1042)</label>
            <div className="flex gap-2">
              <input 
                required 
                value={codigo} 
                onChange={e => setCodigo(e.target.value)} 
                className="flex-1 rounded-lg border-gray-300 border p-3 focus:ring-brand-500 focus:border-brand-500" 
                placeholder="TK-XXXX" 
              />
              <button type="submit" className="bg-brand-600 text-white px-4 rounded-lg hover:bg-brand-700">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {searchedTicket === null && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-medium">
              No encontramos ningún equipo con ese código. Por favor verifica.
            </div>
          )}

          {searchedTicket && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{searchedTicket.equipo.modelo}</h3>
                <p className="text-sm text-gray-500">A nombre de: {searchedTicket.cliente.nombre}</p>
                {searchedTicket.finanzas && searchedTicket.finanzas.costoTotal > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Presupuesto Aprobado:</span>
                    <span className="font-bold text-brand-700">${searchedTicket.finanzas.costoTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="relative pl-4 space-y-6">
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
                
                {[
                  { step: 1, label: 'Equipo Ingresado', icon: Package },
                  { step: 2, label: 'En Mesa de Diagnóstico', icon: Search },
                  { step: 3, label: 'En Reparación', icon: Wrench },
                  { step: 4, label: '¡Listo para Entrega!', icon: CheckCircle }
                ].map((item, idx) => {
                  const currentStep = getStepNumber(searchedTicket.estado);
                  const isPast = currentStep > item.step;
                  const isCurrent = currentStep === item.step;
                  const isFuture = currentStep < item.step;
                  
                  return (
                    <div key={idx} className={`relative flex items-center gap-4 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className={`z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                        isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-500 text-white animate-pulse' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isCurrent ? 'text-brand-600 text-lg' : 'text-gray-700'}`}>{item.label}</h4>
                        {isCurrent && <p className="text-xs text-brand-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> Estado actual</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-200">
          Powered by DiagTech Software
        </div>
      </div>
    </div>
  );
}
