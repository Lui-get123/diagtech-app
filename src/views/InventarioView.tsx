import { useState, useRef } from 'react';
import type { Repuesto } from '../types';
import { PlusCircle, PackageSearch, AlertTriangle, Upload } from 'lucide-react';

interface Props {
  inventario: Repuesto[];
  onAddRepuesto: (r: Repuesto) => void;
  onAddRepuestosBulk: (r: Repuesto[]) => void;
}

export function InventarioView({ inventario, onAddRepuesto, onAddRepuestosBulk }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Pantallas');
  const [stock, setStock] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRepuesto({
      id: `REP-${Date.now()}`,
      nombre, categoria, stock, precioVenta
    });
    setNombre(''); setStock(0); setPrecioVenta(0);
    setIsAdding(false);
  };

  const [rawCsvData, setRawCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [colMap, setColMap] = useState<{nombre: number, categoria: number, stock: number, precio: number}>({
    nombre: -1, categoria: -1, stock: -1, precio: -1
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert('El archivo está vacío o no tiene suficientes datos.');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
      
      setCsvHeaders(headers);
      setRawCsvData(dataRows);
      
      // Auto-adivinar columnas si los nombres coinciden
      setColMap({
        nombre: headers.findIndex(h => h.toLowerCase().includes('nombre') || h.toLowerCase().includes('repuesto')),
        categoria: headers.findIndex(h => h.toLowerCase().includes('cat')),
        stock: headers.findIndex(h => h.toLowerCase().includes('stock') || h.toLowerCase().includes('cant')),
        precio: headers.findIndex(h => h.toLowerCase().includes('precio') || h.toLowerCase().includes('costo'))
      });
      
      setIsMapping(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (colMap.nombre === -1 || colMap.stock === -1 || colMap.precio === -1) {
      alert('Debes seleccionar al menos las columnas de Nombre, Stock y Precio.');
      return;
    }

    const nuevosRepuestos: Repuesto[] = [];
    rawCsvData.forEach((row, index) => {
      const nombreVal = row[colMap.nombre];
      if (nombreVal) {
        nuevosRepuestos.push({
          id: `REP-XL-${Date.now()}-${index}`,
          nombre: nombreVal,
          categoria: colMap.categoria !== -1 ? row[colMap.categoria] || 'Otros' : 'Otros',
          stock: parseInt(row[colMap.stock]) || 0,
          precioVenta: parseInt(row[colMap.precio]) || 0
        });
      }
    });

    if (nuevosRepuestos.length > 0) {
      onAddRepuestosBulk(nuevosRepuestos);
      alert(`¡Éxito! Se importaron ${nuevosRepuestos.length} repuestos correctamente.`);
    } else {
      alert('No se pudo extraer ningún dato con la configuración seleccionada.');
    }
    
    setIsMapping(false);
    setRawCsvData([]);
  };

  const filtered = inventario.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Control de Inventario</h2>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="inline-flex items-center gap-x-1.5 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Upload className="h-5 w-5 text-gray-400" /> Subir Excel (.csv)
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className="inline-flex items-center gap-x-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm">
            <PlusCircle className="h-5 w-5" /> Nuevo Repuesto
          </button>
        </div>
      </div>

      {isAdding && !isMapping && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2"><label className="block text-sm text-gray-700 mb-1">Nombre del Repuesto</label><input required value={nombre} onChange={e=>setNombre(e.target.value)} className="w-full border rounded-md p-2 focus:ring-brand-500" placeholder="Ej. Pantalla iPhone 13 Pro" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Categoría</label><select value={categoria} onChange={e=>setCategoria(e.target.value)} className="w-full border rounded-md p-2"><option>Pantallas</option><option>Baterías</option><option>Cargadores</option><option>Cámaras</option><option>Otros</option></select></div>
          <div><label className="block text-sm text-gray-700 mb-1">Stock Inicial</label><input type="number" required value={stock} onChange={e=>setStock(Number(e.target.value))} className="w-full border rounded-md p-2" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Precio Sugerido ($)</label><input type="number" required value={precioVenta} onChange={e=>setPrecioVenta(Number(e.target.value))} className="w-full border rounded-md p-2" /></div>
          
          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700">Guardar en Inventario</button>
          </div>
        </form>
      )}

      {isMapping && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Traductor de Archivo Excel (.csv)</h3>
          <p className="text-sm text-gray-500 mb-6">Hemos leído tu archivo. Por favor indícanos qué columna corresponde a cada dato.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Nombre del Repuesto <span className="text-red-500">*</span></label>
              <select value={colMap.nombre} onChange={e => setColMap({...colMap, nombre: Number(e.target.value)})} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 border">
                <option value={-1}>-- Seleccionar --</option>
                {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Categoría (Opcional)</label>
              <select value={colMap.categoria} onChange={e => setColMap({...colMap, categoria: Number(e.target.value)})} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 border">
                <option value={-1}>-- No importar --</option>
                {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Stock Disponible <span className="text-red-500">*</span></label>
              <select value={colMap.stock} onChange={e => setColMap({...colMap, stock: Number(e.target.value)})} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 border">
                <option value={-1}>-- Seleccionar --</option>
                {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Precio de Venta <span className="text-red-500">*</span></label>
              <select value={colMap.precio} onChange={e => setColMap({...colMap, precio: Number(e.target.value)})} className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 border">
                <option value={-1}>-- Seleccionar --</option>
                {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 border-t pt-4">
            <button onClick={() => {setIsMapping(false); setRawCsvData([]);}} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar Importación</button>
            <button onClick={handleConfirmImport} className="px-4 py-2 text-sm text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Confirmar y subir a la base de datos
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center">
          <PackageSearch className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar repuestos..." className="border-0 bg-transparent focus:ring-0 text-sm w-full outline-none" />
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Repuesto</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{r.categoria}</td>
                <td className="px-6 py-4 text-sm font-bold">
                  {r.stock <= 2 ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {r.stock} (Bajo)</span> : <span className="text-green-600">{r.stock}</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">${r.precioVenta.toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay repuestos registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
