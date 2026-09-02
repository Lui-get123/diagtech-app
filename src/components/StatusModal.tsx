import { useState, useEffect } from 'react';
import type { Ticket, TicketStatus, Repuesto } from '../types';
import { X, DollarSign, Package } from 'lucide-react';

interface Props {
  ticket: Ticket | null;
  inventario: Repuesto[];
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: TicketStatus, finanzas?: { costoTotal: number; abono: number }, repuestosUsados?: string[]) => void;
}

export function StatusModal({ ticket, inventario, onClose, onUpdateStatus }: Props) {
  const [costo, setCosto] = useState<number>(0);
  const [abonoHistorico, setAbonoHistorico] = useState<number>(0);
  const [nuevoAbono, setNuevoAbono] = useState<number>(0);
  
  // Estados para el prompt de repuestos
  const [showRepuestosPrompt, setShowRepuestosPrompt] = useState(false);
  const [statusToSave, setStatusToSave] = useState<TicketStatus | null>(null);
  const [selectedRepuestoId, setSelectedRepuestoId] = useState<string>('');

  useEffect(() => {
    if (ticket?.finanzas) {
      setCosto(ticket.finanzas.costoTotal);
      setAbonoHistorico(ticket.finanzas.abono);
    } else {
      setCosto(0);
      setAbonoHistorico(0);
    }
    setNuevoAbono(0);
    setShowRepuestosPrompt(false);
    setStatusToSave(null);
    setSelectedRepuestoId('');
  }, [ticket]);

  if (!ticket) return null;

  const statuses: TicketStatus[] = [
    'Ingresado', 'Diagnosticando', 'En Reparación', 'En Espera (Repuesto)', 'Listo p/ Entrega', 'Entregado'
  ];

  const handleUpdate = (status: TicketStatus) => {
    const totalAbonado = abonoHistorico + nuevoAbono;
    // Si cambia a 'Listo p/ Entrega' y hay inventario disponible, preguntar qué repuesto usó
    if (status === 'Listo p/ Entrega' && inventario.length > 0) {
      setStatusToSave(status);
      setShowRepuestosPrompt(true);
    } else {
      onUpdateStatus(ticket.id, status, { costoTotal: costo, abono: totalAbonado });
      onClose();
    }
  };

  const confirmWithRepuestos = () => {
    const totalAbonado = abonoHistorico + nuevoAbono;
    const usados = selectedRepuestoId ? [selectedRepuestoId] : [];
    onUpdateStatus(ticket.id, statusToSave!, { costoTotal: costo, abono: totalAbonado }, usados);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Actualizar Estado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Ticket: <span className="font-semibold text-gray-900">#{ticket.id}</span>
            <br/>Equipo: {ticket.equipo.modelo}
          </p>

          {!showRepuestosPrompt ? (
            <>
              {/* Módulo de Finanzas Rápidas */}
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center mb-3">
                  <DollarSign className="w-4 h-4 mr-1" /> Finanzas
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-green-900 mb-1">Costo Total ($)</label>
                    <input type="number" min="0" value={costo} onChange={e => setCosto(Number(e.target.value))} className="w-full text-sm border-green-200 rounded p-1.5 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div className="flex justify-between text-xs text-green-800">
                    <span>Total Abonado Hasta Ahora:</span>
                    <span className="font-semibold">${abonoHistorico.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-green-900 mb-1">Agregar Nuevo Abono ($)</label>
                    <input type="number" min="0" value={nuevoAbono} onChange={e => setNuevoAbono(Number(e.target.value))} className="w-full text-sm border-green-200 rounded p-1.5 focus:ring-green-500 focus:border-green-500" placeholder="Ej. 50000" />
                  </div>
                  {costo > 0 && (
                    <div className="pt-2 mt-2 border-t border-green-200/50 flex justify-between text-sm font-semibold">
                      <span className="text-green-800">Saldo Pendiente:</span>
                      <span className={costo - (abonoHistorico + nuevoAbono) > 0 ? "text-red-600" : "text-green-600"}>
                        ${Math.max(0, costo - (abonoHistorico + nuevoAbono)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleUpdate(status)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      ticket.estado === status 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {status === ticket.estado ? `(Actual) ${status}` : status}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="mb-4 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">¿Usaste algún repuesto?</h3>
                <p className="text-sm text-gray-500 mt-1">Selecciona el repuesto para descontarlo del inventario automáticamente.</p>
              </div>

              <div className="mb-6">
                <select 
                  value={selectedRepuestoId} 
                  onChange={e => setSelectedRepuestoId(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">No usé repuestos en esta reparación</option>
                  {inventario.filter(r => r.stock > 0).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} (Stock: {r.stock}) - ${r.precioVenta.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRepuestosPrompt(false)} 
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button 
                  onClick={confirmWithRepuestos} 
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
