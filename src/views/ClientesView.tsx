import { useState, useMemo } from 'react';
import type { Cliente, Ticket } from '../types';
import { PlusCircle, Search, MessageCircle } from 'lucide-react';

interface Props {
  clientes: Cliente[];
  tickets: Ticket[];
  onAddCliente: (c: Cliente) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  highlightedCliente: string | null;
}

export function ClientesView({ clientes, tickets, onAddCliente, searchTerm, setSearchTerm, highlightedCliente }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<'Particular'|'Empresa'>('Particular');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCliente({
      id: `CLI-${Date.now()}`,
      nombre, documento, telefono, email, tipo
    });
    setNombre(''); setDocumento(''); setTelefono(''); setEmail(''); setTipo('Particular');
    setIsAdding(false);
  };

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      c.documento.toLowerCase().includes(term)
    );
  }, [clientes, searchTerm]);

  // Helper para generar el link de WhatsApp
  const getWhatsAppLink = (cliente: Cliente) => {
    // Buscar si tiene algún ticket activo (asumimos el último creado o el primero que encontremos para este demo)
    const activeTicket = tickets.find(t => t.cliente.documento === cliente.documento);
    
    let message = `Hola ${cliente.nombre}, nos comunicamos de DiagTech.`;
    
    if (activeTicket) {
      const trackingLink = `${window.location.origin}/?view=tracking&ticket=${activeTicket.id}`;
      switch(activeTicket.estado) {
        case 'Ingresado': 
          message += ` Le confirmamos que su equipo ${activeTicket.equipo.modelo} fue registrado exitosamente. Puede ver el estado en vivo aquí: ${trackingLink}`; break;
        case 'Diagnosticando': 
          message += ` Le informamos que su equipo ${activeTicket.equipo.modelo} está en este momento en mesa de diagnóstico. Puede seguir el progreso aquí: ${trackingLink}`; break;
        case 'En Reparación': 
          message += ` Le informamos que nuestro técnico ya está trabajando en la reparación de su ${activeTicket.equipo.modelo}. Seguimiento en vivo: ${trackingLink}`; break;
        case 'En Espera (Repuesto)': 
          message += ` Su equipo ${activeTicket.equipo.modelo} se encuentra pausado a la espera de un repuesto. Detalles aquí: ${trackingLink}`; break;
        case 'Listo p/ Entrega': 
          message += ` ¡Buenas noticias! Su equipo ${activeTicket.equipo.modelo} ya está reparado y listo. Puede pasar a recogerlo. Comprobante: ${trackingLink}`; break;
        case 'Entregado':
          message += ` Esperamos que su equipo ${activeTicket.equipo.modelo} esté funcionando perfectamente. Historial de reparación: ${trackingLink}`; break;
      }
    } else {
      message += ` ¿En qué le podemos ayudar el día de hoy?`;
    }

    // Limpiar el teléfono para dejar solo los números
    const cleanPhone = cliente.telefono.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Directorio de Clientes</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="inline-flex items-center gap-x-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <PlusCircle className="h-5 w-5" /> Nuevo Cliente
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-700 mb-1">Nombre / Empresa</label><input required value={nombre} onChange={e=>setNombre(e.target.value)} className="w-full border rounded-md p-2 focus:ring-brand-500 focus:border-brand-500" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Cédula / NIT</label><input required value={documento} onChange={e=>setDocumento(e.target.value)} className="w-full border rounded-md p-2 focus:ring-brand-500 focus:border-brand-500" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Teléfono (WhatsApp)</label><input required placeholder="+57 300 000 0000" value={telefono} onChange={e=>setTelefono(e.target.value)} className="w-full border rounded-md p-2 focus:ring-brand-500 focus:border-brand-500" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md p-2 focus:ring-brand-500 focus:border-brand-500" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Tipo</label><select value={tipo} onChange={e=>setTipo(e.target.value as any)} className="w-full border rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"><option value="Particular">Particular</option><option value="Empresa">Empresa</option></select></div>
          
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700">Registrar Cliente</button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" 
              placeholder="Buscar por nombre, cédula o NIT..." 
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contacto (WhatsApp)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredClientes.map(c => (
              <tr 
                key={c.id} 
                className={`transition-all duration-500 ${
                  highlightedCliente === c.documento 
                    ? 'bg-yellow-100 ring-2 ring-yellow-400 z-10 relative' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{c.documento}</td>
                <td className="px-6 py-4 text-sm">
                  <a 
                    href={getWhatsAppLink(c)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                    {c.telefono}
                  </a>
                  <div className="text-xs text-gray-400 mt-1">{c.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.tipo === 'Empresa' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {c.tipo}
                  </span>
                </td>
              </tr>
            ))}
            {filteredClientes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No se encontró ningún cliente con esos datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
