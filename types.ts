
export interface Student {
  id: string;
  name: string;
  age: number;
  email: string;
  phone1: string;
  phone2: string;
  course: 'LUNES A VIERNES' | 'V, S Y D' | 'INTENSIVO 1' | 'INTENSIVO 2';
  photo?: string; // Base64 string o URL
}

export type ViewMode = 'table' | 'json';
