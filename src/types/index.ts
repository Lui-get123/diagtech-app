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
    marca?: string;
    modelo: string;
    imei?: string;
    color?: string;
    contrasena?: string; // PIN/Patrón
    falla: string;
  };
  recepcion?: {
    checklist: {
      pantalla: 'OK' | 'Falla' | 'No Prob';
      puertoCarga: 'OK' | 'Falla' | 'No Prob';
      camaras: 'OK' | 'Falla' | 'No Prob';
      botones: 'OK' | 'Falla' | 'No Prob';
      audio: 'OK' | 'Falla' | 'No Prob';
      senal: 'OK' | 'Falla' | 'No Prob';
      estetico: 'OK' | 'Falla' | 'No Prob';
    };
    observacionesEsteticas?: string;
  };
  firmaCliente?: string; // Base64 de la firma
  tiempoEstimado?: string;
  garantiaDias?: number;
  repuestosUsados?: { id: string; nombre: string; precio: number }[];
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
    metodoAbono?: string;
    gastosInternos?: { concepto: string; monto: number }[];
  };
}

export interface Repuesto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  precioVenta: number;
}
