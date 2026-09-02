import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MonitorSmartphone, Users, Wrench, PlusCircle, Cpu, Package, Menu, X, Lock, LogOut 
} from 'lucide-react';
import type { Ticket, TicketStatus, Cliente, Tecnico, Repuesto } from './types';
import { NewTicketModal } from './components/NewTicketModal';
import { DashboardView } from './views/DashboardView';
import { EquiposView } from './views/EquiposView';
import { ClientesView } from './views/ClientesView';
import { TecnicosView } from './views/TecnicosView';
import { InventarioView } from './views/InventarioView';
import { FinanzasView } from './views/FinanzasView';
import { TrackingView } from './views/TrackingView';
import { LandingView } from './views/LandingView';
import { supabase } from './lib/supabase';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Autenticación Simple (Guardamos el ID del taller localmente)
  const [tallerId, setTallerId] = useState<string | null>(() => localStorage.getItem('diagtech_taller_id'));
  const [authLoading, setAuthLoading] = useState(false);
  const isAuthenticated = !!tallerId;

  const loadData = async (tid: string) => {
    // 1. Clientes
    const { data: cData } = await supabase.from('clientes').select('*').eq('taller_id', tid);
    if (cData) setClientes(cData.map(c => ({
      id: c.id, nombre: c.nombre, documento: c.documento, telefono: c.telefono, tipo: c.tipo, email: c.email
    })));

    // 2. Tecnicos
    const { data: tData } = await supabase.from('tecnicos').select('*').eq('taller_id', tid);
    if (tData) setTecnicos(tData.map(t => ({
      id: t.id, nombre: t.nombre, documento: t.documento, especialidad: t.especialidad, telefono: t.telefono
    })));

    // 3. Inventario
    const { data: rData } = await supabase.from('repuestos').select('*').eq('taller_id', tid);
    if (rData) setInventario(rData.map(r => ({
      id: r.id, nombre: r.nombre, categoria: r.categoria, stock: r.stock, precioVenta: r.precio_venta
    })));

    // 4. Tickets
    const { data: tickData } = await supabase.from('tickets').select('*, cliente:clientes(*), tecnico:tecnicos(*)').eq('taller_id', tid);
    if (tickData) {
      setTickets(tickData.map(t => ({
        id: t.codigo,
        cliente: t.cliente,
        equipo: { tipo: t.equipo_tipo, modelo: t.equipo_modelo, falla: t.equipo_falla },
        tecnicoAsignado: t.tecnico ? { id: t.tecnico.id, nombre: t.tecnico.nombre } : undefined,
        estado: t.estado as TicketStatus,
        fechaIngreso: t.fecha_ingreso,
        finanzas: { costoTotal: t.costo_total, abono: t.abono }
      })));
    }
  };

  useEffect(() => {
    if (tallerId) {
      loadData(tallerId);
    } else {
      setTickets([]);
      setClientes([]);
      setTecnicos([]);
      setInventario([]);
    }
  }, [tallerId]);

  const getInitialView = () => {
    const v = urlParams.get('view');
    if (!v) return 'landing';
    
    if (v === 'landing') return 'landing';
    if (v === 'tracking') return 'tracking';
    if (v === 'register') return isAuthenticated ? 'dashboard' : 'register';
    
    if (v === 'login' || v === 'diagtech-admin') {
      return isAuthenticated ? 'dashboard' : 'login';
    }
    
    if (['dashboard', 'equipos', 'clientes', 'tecnicos', 'inventario', 'finanzas'].includes(v)) {
      return isAuthenticated ? (v as any) : 'login';
    }
    
    return 'landing';
  };

  const [view, setView] = useState<'dashboard' | 'equipos' | 'clientes' | 'tecnicos' | 'inventario' | 'finanzas' | 'tracking' | 'login' | 'landing' | 'register'>(getInitialView());
  
  // Estados de formularios de Auth
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tallerNameInput, setTallerNameInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inventario, setInventario] = useState<Repuesto[]>([]);

  // Sincronizar el botón de "Atrás/Adelante" del navegador
  useEffect(() => {
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const v = currentParams.get('view');
      
      let nextView = 'landing';
      if (!v || v === 'landing') nextView = 'landing';
      else if (v === 'tracking') nextView = 'tracking';
      else if (v === 'register') nextView = isAuthenticated ? 'dashboard' : 'register';
      else if (v === 'login' || v === 'diagtech-admin') nextView = isAuthenticated ? 'dashboard' : 'login';
      else if (['dashboard', 'equipos', 'clientes', 'tecnicos', 'inventario', 'finanzas'].includes(v)) {
        nextView = isAuthenticated ? v : 'login';
      }
      
      setView(nextView as any);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [highlightedCliente, setHighlightedCliente] = useState<string | null>(null);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  
  // Utilidad para encriptar la contraseña (SHA-256) antes de enviarla a la base de datos
  const hashPassword = async (password: string) => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    const hashedPassword = await hashPassword(passwordInput);

    // Consulta simple a la base de datos con contraseña encriptada
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .eq('email', emailInput)
      .eq('password', hashedPassword)
      .single();

    setAuthLoading(false);

    if (error || !data) {
      setAuthError('Correo o contraseña incorrectos.');
    } else {
      localStorage.setItem('diagtech_taller_id', data.id);
      setTallerId(data.id);
      setView('dashboard');
      window.history.pushState({}, '', '?view=dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const hashedPassword = await hashPassword(passwordInput);

    const { data, error: dbError } = await supabase.from('talleres').insert({
      nombre: tallerNameInput,
      email: emailInput,
      password: hashedPassword,
    }).select().single();

    setAuthLoading(false);

    if (dbError) {
      console.error('Error creando taller:', dbError);
      setAuthError('Error: ' + dbError.message);
      return;
    }

    if (data) {
      localStorage.setItem('diagtech_taller_id', data.id);
      setTallerId(data.id);
      setView('dashboard');
      window.history.pushState({}, '', '?view=dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('diagtech_taller_id');
    setTallerId(null);
    setEmailInput('');
    setPasswordInput('');
    setTallerNameInput('');
    setView('login');
    window.history.pushState({}, '', '?view=login');
  };

  const handleNavClick = (v: typeof view) => {
    setView(v);
    setIsMobileMenuOpen(false);
    
    // Limpiar los formularios si vamos a las pantallas de entrada
    if (v === 'login' || v === 'register' || v === 'landing') {
      setEmailInput('');
      setPasswordInput('');
      setTallerNameInput('');
      setAuthError('');
    }
    
    // Cambiar la URL de forma limpia
    const url = new URL(window.location.href);
    if (v === 'landing') {
      url.search = ''; // Limpiar toda la URL para la portada
    } else if (v === 'tracking') {
      url.searchParams.set('view', 'tracking');
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

  const handleAddTicket = async (data: Omit<Ticket, 'id' | 'fechaIngreso' | 'estado'>) => {
    if (!tallerId) return;

    let clienteId = '';
    const existingClient = clientes.find(c => c.documento === data.cliente.documento);
    if (existingClient) {
      clienteId = existingClient.id;
    } else {
      const { data: newClient } = await supabase.from('clientes').insert({
        taller_id: tallerId,
        nombre: data.cliente.nombre,
        documento: data.cliente.documento,
        telefono: data.cliente.telefono,
        tipo: data.cliente.tipo
      }).select('id').single();
      if (newClient) clienteId = newClient.id;
    }

    const tkNum = tickets.length > 0 ? Math.max(...tickets.map(t => parseInt(t.id.split('-')[1] || '1000'))) + 1 : 1000;
    const codigo = `TK-${tkNum}`;

    await supabase.from('tickets').insert({
      taller_id: tallerId,
      cliente_id: clienteId,
      codigo,
      equipo_tipo: data.equipo.tipo,
      equipo_modelo: data.equipo.modelo,
      equipo_falla: data.equipo.falla,
      costo_total: data.finanzas?.costoTotal || 0,
      abono: data.finanzas?.abono || 0,
      estado: 'Ingresado'
    });

    loadData(tallerId);
  };

  const handleUpdateStatus = async (id: string, newStatus: TicketStatus, finanzas?: { costoTotal: number; abono: number }, repuestosUsados?: string[]) => {
    if (!tallerId) return;

    const updateData: any = { estado: newStatus };
    if (finanzas) {
      updateData.costo_total = finanzas.costoTotal;
      updateData.abono = finanzas.abono;
    }
    
    await supabase.from('tickets').update(updateData).eq('codigo', id).eq('taller_id', tallerId);

    if (repuestosUsados && repuestosUsados.length > 0) {
      for (const repId of repuestosUsados) {
        const rep = inventario.find(r => r.id === repId);
        if (rep && rep.stock > 0) {
          await supabase.from('repuestos').update({ stock: rep.stock - 1 }).eq('id', repId);
        }
      }
    }

    loadData(tallerId);
  };

  const handleAddCliente = async (cliente: Cliente) => {
    if (!tallerId) return;
    await supabase.from('clientes').insert({
      taller_id: tallerId,
      nombre: cliente.nombre,
      documento: cliente.documento,
      telefono: cliente.telefono,
      email: cliente.email,
      tipo: cliente.tipo
    });
    loadData(tallerId);
  };

  const handleAddTecnico = async (tecnico: Tecnico) => {
    if (!tallerId) return;
    await supabase.from('tecnicos').insert({
      taller_id: tallerId,
      nombre: tecnico.nombre,
      documento: tecnico.documento,
      especialidad: tecnico.especialidad,
      telefono: tecnico.telefono
    });
    loadData(tallerId);
  };

  const handleAddRepuesto = async (repuesto: Repuesto) => {
    if (!tallerId) return;
    await supabase.from('repuestos').insert({
      taller_id: tallerId,
      nombre: repuesto.nombre,
      categoria: repuesto.categoria,
      stock: repuesto.stock,
      precio_venta: repuesto.precioVenta
    });
    loadData(tallerId);
  };

  const handleAddRepuestosBulk = async (nuevos: Repuesto[]) => {
    if (!tallerId) return;
    const inserts = nuevos.map(r => ({
      taller_id: tallerId,
      nombre: r.nombre,
      categoria: r.categoria,
      stock: r.stock,
      precio_venta: r.precioVenta
    }));
    await supabase.from('repuestos').insert(inserts);
    loadData(tallerId);
  };

  // --- ELIMINAR Y EDITAR DATOS ---
  
  const handleDeleteCliente = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente? Se borrarán sus datos permanentemente.')) return;
    await supabase.from('clientes').delete().eq('id', id).eq('taller_id', tallerId!);
    loadData(tallerId!);
  };

  const handleDeleteTecnico = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este técnico?')) return;
    await supabase.from('tecnicos').delete().eq('id', id).eq('taller_id', tallerId!);
    loadData(tallerId!);
  };

  const handleDeleteRepuesto = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este repuesto del inventario?')) return;
    await supabase.from('repuestos').delete().eq('id', id).eq('taller_id', tallerId!);
    loadData(tallerId!);
  };

  const handleDeleteTicket = async (codigo: string) => {
    if (!confirm('¿Seguro que deseas eliminar este ticket? Esta acción no se puede deshacer.')) return;
    await supabase.from('tickets').delete().eq('codigo', codigo).eq('taller_id', tallerId!);
    loadData(tallerId!);
  };

  // Titulo dinamico del Header
  const headerTitles = {
    dashboard: 'Resumen de Operaciones',
    equipos: 'Catálogo de Equipos',
    clientes: 'Directorio de Clientes',
    tecnicos: 'Gestión de Técnicos',
    inventario: 'Control de Inventario',
    finanzas: 'Gestión Financiera',
    tracking: 'Portal de Seguimiento'
  };

  // Si es la página de marketing inicial
  if (view === 'landing') {
    return (
      <div key="landing" className="animate-fade-in">
        <LandingView onNavigate={handleNavClick} />
      </div>
    );
  }

  // Vista rápida para cuando quieran registrarse
  if (view === 'register') {
    return (
      <div key="register" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
            <Cpu className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Crea tu cuenta en DiagTech</h2>
          <p className="mt-2 text-sm text-gray-600">Únete a cientos de talleres organizados</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
            {authError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de tu Taller</label>
                <div className="mt-1">
                  <input type="text" required value={tallerNameInput} onChange={e => setTallerNameInput(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="Ej: FixIt Express" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <div className="mt-1">
                  <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="tu@correo.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="mt-1">
                  <input type="password" required minLength={6} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={authLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none disabled:opacity-50">
                Registrarme Gratis
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => handleNavClick('landing')} className="text-sm text-brand-600 hover:text-brand-500 font-medium">Volver al inicio</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render especial sin barra lateral para simular la web del cliente
  if (view === 'tracking') {
    return (
      <div key="tracking" className="relative h-screen w-full animate-fade-in">
        <button 
          onClick={() => handleNavClick('landing')} 
          className="absolute top-4 left-4 z-50 bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center backdrop-blur border border-gray-200 text-sm"
        >
          ← Volver a DiagTech
        </button>
        <TrackingView />
      </div>
    );
  }

  // Protección del Dashboard: Si la vista es login, mostramos la pantalla de bloqueo
  if (view === 'login') {
    return (
      <div key="login" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Acceso Restringido</h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión para gestionar tu taller</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
            {authError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <div className="mt-1">
                  <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="tu@correo.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="mt-1">
                  <input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={authLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none disabled:opacity-50">
                Ingresar al Sistema
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => handleNavClick('landing')} className="text-sm text-brand-600 hover:text-brand-500 font-medium">Volver a la página principal</button>
            </div>
          </div>
        </div>
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
          <button onClick={() => handleNavClick('finanzas')} className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${view === 'finanzas' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard className={`h-5 w-5 mr-3 ${view === 'finanzas' ? 'text-gray-300' : 'text-gray-400 group-hover:text-white'}`} /> Finanzas
          </button>
        </nav>
        
        {/* Botón de Logout */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 hover:text-red-400 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
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

        {/* Dynamic Content View */}
        <div key={view} className="flex-1 overflow-y-auto animate-fade-in flex flex-col">
          {view === 'dashboard' && <DashboardView tickets={tickets} inventario={inventario} onUpdateStatus={handleUpdateStatus} onClientClick={handleGoToCliente} />}
          {view === 'equipos' && <EquiposView tickets={tickets} onDeleteTicket={handleDeleteTicket} />}
          {view === 'clientes' && (
            <ClientesView 
              clientes={clientes} 
              tickets={tickets} 
              onAddCliente={handleAddCliente} 
              searchTerm={clienteSearchTerm}
              setSearchTerm={setClienteSearchTerm}
              highlightedCliente={highlightedCliente}
              onDeleteCliente={handleDeleteCliente}
            />
          )}
          {view === 'tecnicos' && <TecnicosView tecnicos={tecnicos} onAddTecnico={handleAddTecnico} onDeleteTecnico={handleDeleteTecnico} />}
          {view === 'inventario' && <InventarioView inventario={inventario} onAddRepuesto={handleAddRepuesto} onAddRepuestosBulk={handleAddRepuestosBulk} onDeleteRepuesto={handleDeleteRepuesto} />}
          {view === 'finanzas' && <FinanzasView tickets={tickets} />}
        </div>
      </main>

      <NewTicketModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSave={handleAddTicket} 
        tecnicos={tecnicos}
      />
    </div>
  );
}

export default App;
