import { useState } from 'react';
import type { Ticket } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Omit<Ticket, 'id' | 'fechaIngreso' | 'estado'>) => void;
}

export function NewTicketModal({ isOpen, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoCliente, setTipoCliente] = useState<'Particular' | 'Empresa'>('Particular');
  const [tipoEquipo, setTipoEquipo] = useState('Smartphone');
  const [modelo, setModelo] = useState('');
  const [falla, setFalla] = useState('');
  const [tecnico, setTecnico] = useState('');
  
  // Finanzas
  const [costoTotal, setCostoTotal] = useState(0);
  const [abono, setAbono] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cliente: { id: `CLI-TEMP`, nombre, documento, telefono, tipo: tipoCliente, email: '' },
      equipo: { tipo: tipoEquipo, modelo, falla },
      tecnicoAsignado: tecnico ? { id: `T-TEMP`, nombre: tecnico } : undefined,
      finanzas: { costoTotal, abono }
    });
    // Limpiar form
    setNombre(''); setDocumento(''); setTelefono(''); setModelo(''); setFalla(''); setTecnico(''); setCostoTotal(0); setAbono(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Ingreso de Equipo</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Sección Cliente */}
          <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Empresa</label>
              <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / NIT</label>
              <input required type="text" value={documento} onChange={e => setDocumento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input required type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
              <select value={tipoCliente} onChange={e => setTipoCliente(e.target.value as any)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="Particular">Particular</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
          </div>

          {/* Sección Equipo */}
          <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">Datos del Equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipo</label>
              <select value={tipoEquipo} onChange={e => setTipoEquipo(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop/PC">Laptop / PC</option>
                <option value="Tablet">Tablet</option>
                <option value="Impresora">Impresora</option>
                <option value="Consola">Consola de Videojuegos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca y Modelo</label>
              <input required type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. iPhone 13 Pro" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Falla Reportada</label>
              <textarea required rows={3} value={falla} onChange={e => setFalla(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Describe el problema del equipo..."></textarea>
            </div>
          </div>

          {/* Asignación */}
          <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">Asignación</h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico (Opcional)</label>
            <select value={tecnico} onChange={e => setTecnico(e.target.value)} className="w-full md:w-1/2 rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500">
              <option value="">-- Sin asignar --</option>
              <option value="Roberto G.">Roberto G.</option>
              <option value="Juan P.">Juan P.</option>
              <option value="Laura M.">Laura M.</option>
            </select>
          </div>

          {/* Finanzas Iniciales */}
          <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">Finanzas (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total de Reparación ($)</label>
              <input type="number" min="0" value={costoTotal} onChange={e => setCostoTotal(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. 150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abono Inicial del Cliente ($)</label>
              <input type="number" min="0" value={abono} onChange={e => setAbono(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. 50000" />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">
              Guardar Ingreso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
