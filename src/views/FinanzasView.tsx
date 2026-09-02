import { useMemo } from 'react';
import type { Ticket } from '../types';
import { DollarSign, TrendingUp, CreditCard, Wallet, Calendar } from 'lucide-react';

interface Props {
  tickets: Ticket[];
}

export function FinanzasView({ tickets }: Props) {
  // Calculamos los ingresos totales (Abonos + Costos Totales de tickets entregados)
  const stats = useMemo(() => {
    let ingresosPotenciales = 0;
    let abonosRecibidos = 0;
    let ingresosCobrados = 0;

    const ticketsMesActual = tickets.filter(t => {
      const fecha = new Date(t.fechaIngreso);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    });

    ticketsMesActual.forEach(t => {
      ingresosPotenciales += (t.finanzas?.costoTotal || 0);
      abonosRecibidos += (t.finanzas?.abono || 0);
      
      // Si el ticket ya se entregó, se asume que se cobró el total
      if (t.estado === 'Entregado') {
        ingresosCobrados += (t.finanzas?.costoTotal || 0);
      } else {
        // Si no se ha entregado, solo contamos el abono inicial como ingreso cobrado
        ingresosCobrados += (t.finanzas?.abono || 0);
      }
    });

    return {
      ingresosPotenciales,
      abonosRecibidos,
      ingresosCobrados,
      porCobrar: ingresosPotenciales - ingresosCobrados
    };
  }, [tickets]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Resumen Financiero (Mes Actual)</h2>
        <p className="text-sm text-gray-500 mt-1">Monitorea los ingresos y proyecciones de tu taller.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Potenciales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">${stats.ingresosPotenciales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Suma de todos los costos de reparación</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Dinero en Caja (Cobrado)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-2">${stats.ingresosCobrados.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Abonos + Tickets Entregados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Solo Abonos</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-2">${stats.abonosRecibidos.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Dinero adelantado por clientes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Saldo por Cobrar</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-2">${stats.porCobrar.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Dinero pendiente a la entrega</p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Historial de Cobros Recientes (Tickets Entregados)</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cobrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tickets.filter(t => t.estado === 'Entregado').slice(0, 10).map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{t.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{t.equipo.modelo}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Reciente</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">${(t.finanzas?.costoTotal || 0).toLocaleString()}</td>
              </tr>
            ))}
            {tickets.filter(t => t.estado === 'Entregado').length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay tickets entregados recientemente.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
