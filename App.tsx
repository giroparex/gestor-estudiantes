
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  Save, 
  AlertCircle,
  Search,
  CheckCircle,
  Camera,
  User,
  Phone,
  BookOpen,
  Mail,
  Calendar,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Printer
} from 'lucide-react';
import { Student } from './types';
import { generateSampleStudents, refineStudentData } from './services/geminiService';

const COURSE_OPTIONS = ["LUNES A VIERNES", "V, S Y D", "INTENSIVO 1", "INTENSIVO 2"] as const;

type SortKey = 'name' | 'course' | typeof COURSE_OPTIONS[number] | 'none';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: '',
      age: 18,
      email: '',
      phone1: '',
      phone2: '',
      course: 'LUNES A VIERNES',
      photo: ''
    };
    setStudents([newStudent, ...students]);
  };

  const handleUpdateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleUpdateStudent(id, 'photo', base64);
      setFeedback({ type: 'success', message: 'Foto actualizada' });
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoUpload = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleAiGenerate = async () => {
    setIsLoading(true);
    try {
      const newStudents = await generateSampleStudents(5);
      setStudents([...newStudents, ...students]);
      setFeedback({ type: 'success', message: 'Generados 5 nuevos estudiantes con IA' });
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al generar estudiantes' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiRefine = async () => {
    if (students.length === 0) return;
    setIsLoading(true);
    try {
      const refined = await refineStudentData(students);
      setStudents(refined);
      setFeedback({ type: 'success', message: 'Datos refinados por la IA' });
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al refinar datos' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'Archivo exportado' });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setStudents(json);
          setFeedback({ type: 'success', message: 'Importación exitosa' });
        } else {
          setFeedback({ type: 'error', message: 'Formato inválido' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Error al procesar JSON' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone1.includes(searchTerm) ||
    s.phone2.includes(searchTerm) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortKey === 'none') return 0;
    
    if (COURSE_OPTIONS.includes(sortKey as any)) {
      const isA = a.course === sortKey;
      const isB = b.course === sortKey;
      if (isA && !isB) return sortDirection === 'asc' ? -1 : 1;
      if (!isA && isB) return sortDirection === 'asc' ? 1 : -1;
      return a.name.localeCompare(b.name);
    }

    let valA = a[sortKey as keyof Student] || '';
    let valB = b[sortKey as keyof Student] || '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen pb-32">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Users size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestor <span className="text-indigo-600">Estudiantes</span></h1>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm border border-slate-200"
        >
          <Printer size={18} /> <span className="hidden sm:inline">Imprimir Lista</span>
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar alumnos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative inline-block w-full md:w-64">
                <select 
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer font-medium text-slate-700"
                >
                  <option value="none">Sin orden</option>
                  <optgroup label="General">
                    <option value="name">Ordenar por Nombre</option>
                    <option value="course">Agrupar por Curso</option>
                  </optgroup>
                  <optgroup label="Priorizar Curso">
                    {COURSE_OPTIONS.map(course => (
                      <option key={course} value={course}>Ver primero: {course}</option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ArrowUpDown size={16} />
                </div>
                {sortKey !== 'none' && (
                  <button 
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Invertir dirección"
                  >
                    {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button onClick={handleAddStudent} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 font-medium text-sm">
              <Plus size={18} /> Añadir
            </button>
            <button onClick={handleAiGenerate} disabled={isLoading} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors font-medium text-sm disabled:opacity-50">
              <Sparkles size={18} className={isLoading ? 'animate-pulse' : ''} /> IA
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="flex flex-col md:flex-row p-5 gap-6">
                <div className="flex-shrink-0">
                  <div 
                    onClick={() => triggerPhotoUpload(student.id)}
                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-slate-50 border-2 border-slate-100 overflow-hidden cursor-pointer group/avatar flex items-center justify-center shadow-inner"
                  >
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-300" size={48} />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white" size={28} />
                    </div>
                    <input 
                      type="file" 
                      ref={el => { fileInputRefs.current[student.id] = el; }}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(student.id, e)}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <input 
                        value={student.name}
                        onChange={(e) => handleUpdateStudent(student.id, 'name', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-xl font-bold text-slate-900 w-full placeholder:text-slate-300"
                        placeholder="Nombre Completo..."
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <BookOpen size={16} className="text-indigo-500 shrink-0" />
                      <select 
                        value={student.course}
                        onChange={(e) => handleUpdateStudent(student.id, 'course', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 font-semibold cursor-pointer min-w-[140px]"
                      >
                        {COURSE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)} 
                      className="hidden md:flex p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-2 group/field">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Edad:</span>
                      <input 
                        type="number"
                        value={student.age}
                        onChange={(e) => handleUpdateStudent(student.id, 'age', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 font-medium w-12"
                      />
                    </div>
                    <div className="flex items-center gap-2 group/field">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <input 
                        value={student.email}
                        onChange={(e) => handleUpdateStudent(student.id, 'email', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 w-full placeholder:text-slate-400 truncate"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="flex items-center gap-2 group/field">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <input 
                        value={student.phone1}
                        onChange={(e) => handleUpdateStudent(student.id, 'phone1', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 w-full placeholder:text-slate-400"
                        placeholder="Teléfono 1"
                      />
                    </div>
                    <div className="flex items-center gap-2 group/field">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <input 
                        value={student.phone2}
                        onChange={(e) => handleUpdateStudent(student.id, 'phone2', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 w-full placeholder:text-slate-400"
                        placeholder="Teléfono 2"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:hidden flex justify-end">
                  <button 
                    onClick={() => handleDeleteStudent(student.id)} 
                    className="p-2 text-red-400 bg-red-50 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/90 backdrop-blur-lg border border-slate-200 rounded-3xl shadow-2xl p-4 flex items-center justify-between z-[60]">
        <div className="flex items-center gap-6 px-2">
          <label className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors group">
            <div className="bg-slate-50 group-hover:bg-indigo-50 p-2 rounded-xl transition-colors">
              <Upload size={22} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Importar</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
          </label>
          
          <button onClick={handleExportJson} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors group">
            <div className="bg-slate-50 group-hover:bg-indigo-50 p-2 rounded-xl transition-colors">
              <Download size={22} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Exportar</span>
          </button>
        </div>

        <div className="h-10 w-px bg-slate-100 mx-2"></div>

        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{students.length}</span>
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alumnos Totales</span>
        </div>
      </div>
    </div>
  );
};

export default App;
