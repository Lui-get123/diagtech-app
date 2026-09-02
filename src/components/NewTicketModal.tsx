import React, { useState, useRef, useEffect } from 'react';
import type { Ticket, Tecnico } from '../types';
import { X, Plus, Eraser } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Omit<Ticket, 'id' | 'fechaIngreso' | 'estado'>) => void;
  tecnicos: Tecnico[];
}

export function NewTicketModal({ isOpen, onClose, onSave, tecnicos }: Props) {
  // Cliente
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipoCliente] = useState<'Particular' | 'Empresa'>('Particular');

  // Equipo
  const [tipoEquipo, setTipoEquipo] = useState('Smartphone');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [falla, setFalla] = useState('');
  const [tecnico, setTecnico] = useState('');

  // Checklist
  type ChecklistState = 'OK' | 'Falla' | 'No Prob';
  const [checklist, setChecklist] = useState({
    pantalla: 'No Prob' as ChecklistState,
    puertoCarga: 'No Prob' as ChecklistState,
    camaras: 'No Prob' as ChecklistState,
    botones: 'No Prob' as ChecklistState,
    audio: 'No Prob' as ChecklistState,
    senal: 'No Prob' as ChecklistState,
    estetico: 'No Prob' as ChecklistState,
  });
  const [observacionesEsteticas, setObservacionesEsteticas] = useState('');

  // Finanzas y Garantía
  const [costoTotal, setCostoTotal] = useState(0);
  const [abono, setAbono] = useState(0);
  const [metodoAbono, setMetodoAbono] = useState('Efectivo');
  const [tiempoEstimado, setTiempoEstimado] = useState('Por Definir');
  const [garantiaDias, setGarantiaDias] = useState(30);

  // Firma
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Reset function
  const resetForm = () => {
    setNombre(''); setDocumento(''); setTelefono(''); setEmail('');
    setMarca(''); setModelo(''); setImei(''); setColor(''); setContrasena(''); setFalla(''); setTecnico('');
    setChecklist({
      pantalla: 'No Prob', puertoCarga: 'No Prob', camaras: 'No Prob',
      botones: 'No Prob', audio: 'No Prob', senal: 'No Prob', estetico: 'No Prob'
    });
    setObservacionesEsteticas('');
    setCostoTotal(0); setAbono(0); setMetodoAbono('Efectivo');
    setTiempoEstimado('Por Definir'); setGarantiaDias(30);
    clearSignature();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Firma Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const techObj = tecnicos.find(t => t.id === tecnico);
    
    const canvas = canvasRef.current;
    const firma = canvas ? canvas.toDataURL('image/png') : '';
    
    // Si la firma está en blanco (1px image length < 100 approx), enviamos vacio
    const firmaValida = firma.length > 200 ? firma : undefined;

    onSave({
      cliente: { id: `CLI-TEMP`, nombre, documento, telefono, tipo: tipoCliente, email },
      equipo: { tipo: tipoEquipo, marca, modelo, imei, color, contrasena, falla },
      recepcion: {
        checklist,
        observacionesEsteticas
      },
      firmaCliente: firmaValida,
      tiempoEstimado,
      garantiaDias,
      tecnicoAsignado: techObj ? { id: techObj.id, nombre: techObj.nombre } : undefined,
      finanzas: { costoTotal, abono, metodoAbono }
    });
    
    onClose();
  };

  const ChecklistRow = ({ label, field }: { label: string, field: keyof typeof checklist }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button type="button" onClick={() => setChecklist({...checklist, [field]: 'OK'})} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${checklist[field] === 'OK' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>OK</button>
        <button type="button" onClick={() => setChecklist({...checklist, [field]: 'Falla'})} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${checklist[field] === 'Falla' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Falla</button>
        <button type="button" onClick={() => setChecklist({...checklist, [field]: 'No Prob'})} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${checklist[field] === 'No Prob' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>No Prob.</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nuevo Ticket de Reparación</h2>
            <p className="text-sm text-gray-500 mt-0.5">Registra un equipo para servicio técnico</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-200 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-0 flex flex-col bg-gray-50">
          <div className="p-6 space-y-8">
            
            {/* SECCION: CLIENTE */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-brand-600 mb-4 flex items-center gap-2">1. Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / ID *</label>
                  <input required type="text" value={documento} onChange={e => setDocumento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📱 WhatsApp / Teléfono *</label>
                  <input required type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">✉️ Email (Opcional)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="cliente@correo.com" />
                </div>
              </div>
            </div>

            {/* SECCION: EQUIPO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-brand-600 mb-4 flex items-center gap-2">2. Detalle del Equipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select value={tipoEquipo} onChange={e => setTipoEquipo(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                    <option value="Smartphone">📱 Smartphone</option>
                    <option value="Laptop/PC">💻 Laptop/PC</option>
                    <option value="Tablet">💊 Tablet</option>
                    <option value="Consola">🎮 Consola</option>
                    <option value="Otro">🔧 Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input required type="text" value={marca} onChange={e => setMarca(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. Samsung" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input required type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. S21 Ultra" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🆔 IMEI / Serial</label>
                  <input type="text" value={imei} onChange={e => setImei(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="15 dígitos o serial..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🎨 Color</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. Negro Mate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔐 Contraseña / PIN (Privado)</label>
                  <input type="text" value={contrasena} onChange={e => setContrasena(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej. 1234 o Patrón Z" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Detalles de la Falla Reportada *</label>
                <textarea required rows={3} value={falla} onChange={e => setFalla(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 bg-red-50/30 text-gray-900" placeholder="Describa el problema que indica el cliente de forma clara..."></textarea>
              </div>
            </div>

            {/* SECCION: CHECKLIST */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-brand-600 flex items-center gap-2">3. Inspección de Recepción (Checklist)</h3>
                <button type="button" onClick={() => setChecklist({
                  pantalla: 'OK', puertoCarga: 'OK', camaras: 'OK',
                  botones: 'OK', audio: 'OK', senal: 'OK', estetico: 'OK'
                })} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100">✅ Marcar Todo OK</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-6">
                <ChecklistRow label="Pantalla / Touch" field="pantalla" />
                <ChecklistRow label="Puerto de Carga" field="puertoCarga" />
                <ChecklistRow label="Cámaras (Front/Tras)" field="camaras" />
                <ChecklistRow label="Botones Físicos" field="botones" />
                <ChecklistRow label="Audio (Bocina/Mic)" field="audio" />
                <ChecklistRow label="Señal (SIM/Wi-Fi)" field="senal" />
                <ChecklistRow label="Estético / Chasis" field="estetico" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalles Estéticos / Observaciones Adicionales</label>
                <textarea rows={2} value={observacionesEsteticas} onChange={e => setObservacionesEsteticas(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Rayón en esquina superior derecha, mica astillada..."></textarea>
              </div>
            </div>

            {/* SECCION: FINANZAS Y GARANTIA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-brand-600 mb-4 flex items-center gap-2">4. Finanzas y Condiciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Presupuesto / Total</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold">$</span>
                    <input type="number" min="0" value={costoTotal} onChange={e => setCostoTotal(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm border p-3 pl-8 focus:ring-brand-500 focus:border-brand-500 text-lg font-bold" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anticipo / Abono</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold">$</span>
                    <input type="number" min="0" value={abono} onChange={e => setAbono(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm border p-3 pl-8 focus:ring-brand-500 focus:border-brand-500 text-lg font-bold text-green-600" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Método de Pago (Abono)</label>
                  <select value={metodoAbono} onChange={e => setMetodoAbono(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 bg-gray-50">
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia / Zelle</option>
                    <option value="Tarjeta">Tarjeta (TDD/TDC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tiempo Estimado</label>
                  <input type="text" value={tiempoEstimado} onChange={e => setTiempoEstimado(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 uppercase font-medium" placeholder="Ej. 24 HORAS" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Garantía (Días)</label>
                  <div className="relative">
                    <input type="number" min="0" value={garantiaDias} onChange={e => setGarantiaDias(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 font-bold" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 font-bold text-xs uppercase">Días</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCION: FIRMA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-brand-600 flex items-center gap-2">5. Firma de Conformidad</h3>
                <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-3 py-1.5 rounded-md">
                  <Eraser className="w-3 h-3" /> Borrar Firma
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                />
                {!isDrawing && <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 text-3xl font-black opacity-30 select-none">Firma del Cliente Aquí</div>}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Dibuja tu firma con el dedo (móvil) o el mouse (PC).</p>
            </div>

          </div>
          
          <div className="bg-white border-t border-gray-200 p-6 flex justify-between items-center shrink-0 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Técnico:</label>
              <select value={tecnico} onChange={e => setTecnico(e.target.value)} className="rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-gray-50 min-w-[200px]">
                <option value="">-- Sin asignar --</option>
                {tecnicos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-8 py-3 text-sm font-black text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crear Ticket de Reparación
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
