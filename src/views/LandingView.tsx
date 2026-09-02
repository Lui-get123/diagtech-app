import { Cpu, ArrowRight, MonitorSmartphone, DollarSign, Package } from 'lucide-react';

interface Props {
  onNavigate: (view: any) => void;
}

export function LandingView({ onNavigate }: Props) {
  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <nav className="relative z-50 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Cpu className="w-8 h-8 text-brand-600" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Diag<span className="text-brand-600">Tech</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('tracking')} 
                className="text-sm font-medium text-gray-500 hover:text-gray-900 hidden sm:block"
              >
                Rastrear Equipo
              </button>
              <button 
                onClick={() => onNavigate('login')} 
                className="text-sm font-medium text-gray-900 hover:text-brand-600"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => onNavigate('register')} 
                className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Registrar mi Taller
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className="mx-auto max-w-2xl py-12 sm:py-24 lg:py-32 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              El software #1 para talleres de reparación de tecnología.{' '}
              <button onClick={() => onNavigate('register')} className="font-semibold text-brand-600"><span className="absolute inset-0" aria-hidden="true"></span>Empieza gratis <span aria-hidden="true">&rarr;</span></button>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Controla tu taller, inventario y finanzas en un solo lugar
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            DiagTech te permite gestionar ingresos de equipos, realizar seguimiento técnico, controlar tu stock de repuestos y notificar a tus clientes automáticamente por WhatsApp.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button onClick={() => onNavigate('register')} className="rounded-md bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 flex items-center gap-2">
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('login')} className="text-sm font-semibold leading-6 text-gray-900">
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600">Todo lo que necesitas</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Diseñado específicamente para servicios técnicos
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600">
                    <MonitorSmartphone className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Gestión de Tickets
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Flujos de trabajo desde que ingresa el equipo hasta que se repara y se entrega al cliente, con notificaciones automatizadas.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600">
                    <Package className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Control de Inventario
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Agrega tus repuestos, haz cargas masivas desde Excel y deja que el sistema descuente el stock mágicamente al reparar equipos.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-600">
                    <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Finanzas Claras
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Registra presupuestos, acepta abonos parciales y obtén alertas visuales de los saldos pendientes de tus clientes al instante.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
