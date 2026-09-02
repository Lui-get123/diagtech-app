export type TicketStatus = 'Ingresado' | 'Diagnosticando' | 'En Reparación' | 'En Espera (Repuesto)' | 'Listo p/ Entrega' | 'Entregado';

export interface Cliente {
  id: string;
  nombre: string;
  documento: string; // Cédula o NIT
  telefono: string;
  tipo: 'Particular' | 'Empresa';
  email: string;
}

export interface Tecnico {
  id: string;
  nombre: string;
  documento: string;
  especialidad: string;
  telefono: string;
}

export interface Ticket {
  id: string;
  cliente: Cliente;
  equipo: {
    tipo: string; // ej. Laptop, Smartphone
    modelo: string;
    falla: string;
  };
  tecnicoAsignado?: {
    id: string;
    nombre: string;
  };
  estado: TicketStatus;
  fechaIngreso: string;
  // Módulo Finanzas
  finanzas?: {
    costoTotal: number;
    abono: number;
  };
}

export interface Repuesto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  precioVenta: number;
}
