import { useState } from 'react';
import type { Tecnico } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Props {
  tecnicos: Tecnico[];
  onAddTecnico: (t: Tecnico) => void;
  onDeleteTecnico?: (id: string) => void;
}

export function TecnicosView({ tecnicos, onAddTecnico, onDeleteTecnico }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTecnico({
      id: `TEC-${Date.now()}`,
      nombre,
      documento,
      especialidad,
      telefono
    });
    setNombre(''); setDocumento(''); setEspecialidad(''); setTelefono('');
    setIsAdding(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Técnicos</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="inline-flex items-center gap-x-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <PlusCircle className="h-5 w-5" /> Nuevo Técnico
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nombre Completo</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Cédula</label>
            <input required value={documento} onChange={e => setDocumento(e.target.value)} className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Especialidad</label>
            <input required placeholder="Ej. Laptops, Apple..." value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
            <input required value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full border rounded-md p-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700">Guardar Técnico</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tecnicos.map(t => (
          <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative">
            <button 
              onClick={() => onDeleteTecnico?.(t.id)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Eliminar Técnico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center mb-4">
              <img className="h-12 w-12 rounded-full mr-4" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.nombre)}&background=e5e7eb&color=374151`} alt="" />
              <div>
                <h3 className="font-semibold text-gray-900 pr-8">{t.nombre}</h3>
                <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full font-medium mt-1 inline-block">{t.especialidad}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Cédula:</strong> {t.documento}</p>
              <p><strong>Teléfono:</strong> {t.telefono}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
