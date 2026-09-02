import { useState } from 'react';
import { 
  LayoutDashboard, MonitorSmartphone, Users, Wrench, PlusCircle, Cpu, Package, Globe, Menu, X 
} from 'lucide-react';
import type { Ticket, TicketStatus, Cliente, Tecnico, Repuesto } from './types';
import { NewTicketModal } from './components/NewTicketModal';
import { DashboardView } from './views/DashboardView';
import { EquiposView } from './views/EquiposView';
import { ClientesView } from './views/ClientesView';
import { TecnicosView } from './views/TecnicosView';
import { InventarioView } from './views/InventarioView';
import { TrackingView } from './views/TrackingView';

// Datos Iniciales (Limpios para producción/pruebas reales)
const initialTickets: Ticket[] = [];
const initialTecnicos: Tecnico[] = [];
const initialClientes: Cliente[] = [];
const initialInventario: Repuesto[] = [];

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = (urlParams.get('view') as any) || 'dashboard';

  const [view, setView] = useState<'dashboard' | 'equipos' | 'clientes' | 'tecnicos' | 'inventario' | 'tracking'>(initialView);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>(initialTecnicos);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [inventario, setInventario] = useState<Repuesto[]>(initialInventario);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [highlightedCliente, setHighlightedCliente] = useState<string | null>(null);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');

  const handleNavClick = (v: typeof view) => {
    setView(v);
    setIsMobileMenuOpen(false);
    
    // Cambiar la URL de forma limpia para que se puedan compartir los links
    const url = new URL(window.location.href);
    if (v === 'dashboard') {
      url.searchParams.delete('view');
      url.searchParams.delete('ticket');
    } else {
      url.searchParams.set('view', v);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleGoToCliente = (documento: string) => {
    setView('clientes');
    setClienteSearchTerm(documento);
    setHighlightedCliente(documento);
    // Remover el highlight después de 3 segundos para que no se quede pegado siempre
    setTimeout(() => setHighlightedCliente(null), 3000);
  };

  const handleAddTicket = (data: Omit<Ticket, 'id' | 'fechaIngreso' | 'estado'>) => {
    const nextIdNumber = tickets.length > 0 ? Math.max(...tickets.map(t => parseInt(t.id.split('-')[1]))) + 1 : 1000;
    const newTicket: Ticket = { ...data, id: `TK-${nextIdNumber}`, estado: 'Ingresado', fechaIngreso: new Date().toISOString() };
    setTickets([newTicket, ...tickets]);
    
    // Si es un cliente nuevo, agregarlo a la BD local
    if (!clientes.find(c => c.documento === data.cliente.documento)) {
      setClientes([...clientes, { ...data.cliente, id: `CLI-${Date.now()}`, email: '' }]);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: TicketStatus, finanzas?: { costoTotal: number; abono: number }, repuestosUsados?: string[]) => {
    setTickets(tickets.map(t => t.id === id ? { 
      ...t, 
      estado: newStatus, 
      ...(finanzas ? { finanzas } : {}) 
    } : t));

    if (repuestosUsados && repuestosUsados.length > 0) {
      setInventario(prev => prev.map(r => 
        repuestosUsados.includes(r.id) ? { ...r, stock: Math.max(0, r.stock - 1) } : r
      ));
    }
  };

  // Titulo dinamico del Header
  const headerTitles = {
    dashboard: 'Resumen de Operaciones',
    equipos: 'Catálogo de Equipos',
    clientes: 'Directorio de Clientes',
    tecnicos: 'Gestión de Técnicos',
    inventario: 'Control de Inventario',
    tracking: 'Portal de Seguimiento'
  };

  // Render especial sin barra lateral para simular la web del cliente
  if (view === 'tracking') {
    return (
      <div className="relative">
        <button 
          onClick={() => setView('dashboard')} 
          className="absolute top-4 left-4 z-50 bg-gray-900/80 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center backdrop-blur"
        >
          ← Volver a DiagTech Admin
        </button>
        <TrackingView tickets={tickets} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex-col transition-transform duration-300 md:relative md:flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center">
            <Cpu className="h-7 w-7 text-brand-500 mr-2" />
            <span className="text-white text-lg font-bold tracking-wide">Diag<span className="text-brand-500">Tech</span></span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button onClick={() => handleNavClick('dashboard')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard className={`h-5 w-5 mr-3 ${view === 'dashboard' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Dashboard
          </button>
          <button onClick={() => handleNavClick('equipos')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'equipos' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <MonitorSmartphone className={`h-5 w-5 mr-3 ${view === 'equipos' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Equipos
          </button>
          <button onClick={() => handleNavClick('clientes')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'clientes' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Users className={`h-5 w-5 mr-3 ${view === 'clientes' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Clientes
          </button>
          <button onClick={() => handleNavClick('tecnicos')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'tecnicos' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Wrench className={`h-5 w-5 mr-3 ${view === 'tecnicos' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Técnicos
          </button>
          <button onClick={() => handleNavClick('inventario')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'inventario' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Package className={`h-5 w-5 mr-3 ${view === 'inventario' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Inventario
          </button>
        </nav>
        
        {/* Enlace al Portal Publico */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <button 
            onClick={() => handleNavClick('tracking')} 
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-brand-600 text-gray-300 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-gray-700 hover:border-brand-500"
          >
            <Globe className="w-4 h-4" /> Ver Portal del Cliente
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button 
              className="md:hidden mr-3 text-gray-500 hover:text-gray-700" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{headerTitles[view]}</h1>
          </div>
          <div className="flex items-center space-x-4 pl-2">
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <PlusCircle className="h-5 w-5" /> Nuevo Ingreso
            </button>
          </div>
        </header>

        {/* Content routing */}
        {view === 'dashboard' && <DashboardView tickets={tickets} inventario={inventario} onUpdateStatus={handleUpdateStatus} onClientClick={handleGoToCliente} />}
        {view === 'equipos' && <EquiposView tickets={tickets} />}
        {view === 'clientes' && <ClientesView clientes={clientes} tickets={tickets} onAddCliente={(c) => setClientes([...clientes, c])} searchTerm={clienteSearchTerm} setSearchTerm={setClienteSearchTerm} highlightedCliente={highlightedCliente} />}
        {view === 'tecnicos' && <TecnicosView tecnicos={tecnicos} onAddTecnico={(t) => setTecnicos([...tecnicos, t])} />}
        {view === 'inventario' && <InventarioView inventario={inventario} onAddRepuesto={(r) => setInventario([...inventario, r])} onAddRepuestosBulk={(nuevos) => setInventario([...inventario, ...nuevos])} />}
      </main>

      <NewTicketModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSave={handleAddTicket} />
    </div>
  );
}

export default App;
