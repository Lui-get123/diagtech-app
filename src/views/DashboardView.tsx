import { useState, useMemo } from 'react';
import type { Ticket, TicketStatus, Repuesto } from '../types';
import { 
  ArrowDownLeft, Wrench, CheckCircle, AlertCircle, Search, MonitorSmartphone 
} from 'lucide-react';
import { StatusModal } from '../components/StatusModal';

interface Props {
  tickets: Ticket[];
  inventario: Repuesto[];
  onUpdateStatus: (id: string, newStatus: TicketStatus, finanzas?: { costoTotal: number; abono: number }, repuestosUsados?: string[]) => void;
  onClientClick: (documento: string) => void;
}

const getStatusBadgeColors = (estado: TicketStatus) => {
  switch (estado) {
    case 'Ingresado': return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    case 'Diagnosticando': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
    case 'En Reparación': return 'bg-amber-50 text-amber-800 ring-amber-600/20';
    case 'En Espera (Repuesto)': return 'bg-red-50 text-red-700 ring-red-600/10';
    case 'Listo p/ Entrega': return 'bg-green-50 text-green-700 ring-green-600/20';
    case 'Entregado': return 'bg-slate-100 text-slate-800 ring-slate-500/20';
    default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
  }
};

export function DashboardView({ tickets, inventario, onUpdateStatus, onClientClick }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [managingTicket, setManagingTicket] = useState<Ticket | null>(null);

  const kpis = useMemo(() => {
    const ingresadosHoy = tickets.length;
    const enReparacion = tickets.filter(t => t.estado === 'En Reparación' || t.estado === 'Diagnosticando').length;
    const listos = tickets.filter(t => t.estado === 'Listo p/ Entrega').length;
    const enEspera = tickets.filter(t => t.estado === 'En Espera (Repuesto)').length;
    return { ingresadosHoy, enReparacion, listos, enEspera };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (!searchTerm.trim()) return tickets;
    const term = searchTerm.toLowerCase();
    return tickets.filter(t => 
      t.cliente.nombre.toLowerCase().includes(term) ||
      t.cliente.documento.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  }, [tickets, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
            <ArrowDownLeft className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Total Ingresados</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.ingresadosHoy}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="flex-shrink-0 bg-amber-50 rounded-lg p-3">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">En Reparación</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.enReparacion}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Listos p/ Entrega</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.listos}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="flex-shrink-0 bg-red-50 rounded-lg p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">En Espera</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.enEspera}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Flujo de Equipos Activos</h3>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-64 rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" 
              placeholder="Buscar por nombre o Cédula/NIT..." 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Equipo</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Finanzas</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{ticket.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <button 
                      onClick={() => onClientClick(ticket.cliente.documento)}
                      className="text-brand-600 font-medium hover:text-brand-800 hover:underline text-left"
                    >
                      {ticket.cliente.nombre}
                    </button>
                    <div className="text-gray-500 text-xs mt-0.5">CC/NIT: {ticket.cliente.documento}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center text-gray-900">
                      <MonitorSmartphone className="h-4 w-4 text-gray-400 mr-2" />
                      {ticket.equipo.modelo}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate">{ticket.equipo.falla}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {ticket.finanzas && ticket.finanzas.costoTotal > 0 ? (
                      ticket.finanzas.costoTotal - ticket.finanzas.abono <= 0 ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                          Pagado al 100%
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-red-600">
                            Debe: ${(ticket.finanzas.costoTotal - ticket.finanzas.abono).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Total: ${ticket.finanzas.costoTotal.toLocaleString()}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sin costear</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColors(ticket.estado)}`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => setManagingTicket(ticket)} className="text-brand-600 hover:text-brand-900">Gestionar</button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-500">No se encontraron equipos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <StatusModal ticket={managingTicket} inventario={inventario} onClose={() => setManagingTicket(null)} onUpdateStatus={onUpdateStatus} />
    </div>
  );
}
