import { useState } from 'react';
import type { Ticket } from '../types';
import { MonitorSmartphone, Calendar, User, FileText, Wrench, Trash2, Printer } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  onDeleteTicket?: (id: string) => void;
}

export function EquiposView({ tickets, onDeleteTicket }: Props) {
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const handlePrint = (id: string) => {
    setPrintingId(id);
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 100);
  };

  const filteredTickets = filterStatus === 'Todos' 
    ? tickets 
    : tickets.filter(t => t.estado === filterStatus);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Catálogo de Equipos en el Taller</h2>
          <p className="text-sm text-gray-500 mt-1">Vista detallada de todos los equipos ingresados.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-gray-300 rounded-md text-sm py-1.5 pl-3 pr-8 focus:ring-brand-500 focus:border-brand-500 border"
          >
            <option value="Todos">Todos los equipos</option>
            <option value="Ingresado">Ingresado</option>
            <option value="Diagnosticando">Diagnosticando</option>
            <option value="En Reparación">En Reparación</option>
            <option value="En Espera (Repuesto)">En Espera (Repuesto)</option>
            <option value="Listo p/ Entrega">Listo p/ Entrega</option>
            <option value="Entregado">Entregado (Completado)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.map(t => (
          <div key={t.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${printingId === t.id ? 'print-only-this' : ''} ${printingId && printingId !== t.id ? 'hidden print:hidden' : ''}`}>
            
            {/* Cabecera del ticket impresa */}
            {printingId === t.id && (
              <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold uppercase">Ticket de Reparación</h1>
                <p className="text-lg font-mono mt-2">{t.id}</p>
                <p className="text-sm mt-1">{new Date(t.fechaIngreso).toLocaleDateString()}</p>
              </div>
            )}

            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-lg text-brand-600 print:hidden">
                  <MonitorSmartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 pr-8 text-lg print:text-xl">{t.equipo.modelo}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 print:hidden">{t.id}</p>
                  <p className="text-sm text-gray-600 hidden print:block mt-1">Tipo: {t.equipo.tipo}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 print:hidden">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {t.estado}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handlePrint(t.id)} 
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
                    title="Imprimir Recibo"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteTicket?.(t.id)} 
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    title="Eliminar Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><FileText className="w-3 h-3"/> Falla Reportada</h4>
                <p className="text-sm text-gray-800 bg-red-50 p-2 rounded border border-red-100">{t.equipo.falla}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><User className="w-3 h-3"/> Cliente</h4>
                  <p className="text-sm text-gray-900 font-medium truncate">{t.cliente.nombre}</p>
                  <p className="text-xs text-gray-500">{t.cliente.documento}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Wrench className="w-3 h-3"/> Finanzas</h4>
                  {t.finanzas && t.finanzas.costoTotal > 0 ? (
                    t.finanzas.costoTotal - t.finanzas.abono <= 0 ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">Pagado</span>
                    ) : (
                      <p className="text-sm font-semibold text-red-600">Debe: ${(t.finanzas.costoTotal - t.finanzas.abono).toLocaleString()}</p>
                    )
                  ) : <span className="text-gray-400 italic text-sm">Sin costear</span>}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(t.fechaIngreso).toLocaleDateString()}
              </div>
              <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded-full border border-brand-200">
                {t.estado}
              </span>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hay equipos registrados en el sistema.
          </div>
        )}
      </div>
    </div>
  );
}
