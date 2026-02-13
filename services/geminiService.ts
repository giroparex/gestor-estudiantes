import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "./types";

// Configuración de la API Key proporcionada
const API_KEY = "AIzaSyCNZCUPHQ6NmoYZ9BBqJOJvYy98SFTOuMw";

// Inicialización de la IA con la clave directa para funcionalidad inmediata
const genAI = new GoogleGenAI(API_KEY);

const COURSE_OPTIONS = ["LUNES A VIERNES", "V, S Y D", "INTENSIVO 1", "INTENSIVO 2"];

// Configuración del modelo estable
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

/**
 * Genera una lista de estudiantes aleatorios con formato profesional
 */
export const generateSampleStudents = async (count: number = 5): Promise<Student[]> => {
  const prompt = `Genera una lista de ${count} objetos de estudiantes en formato JSON. 
  Cursos disponibles: ${COURSE_OPTIONS.join(', ')}. 
  Asegúrate de que los nombres sean realistas y variados. 
  El campo "photo" debe ser un string vacío "".`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              age: { type: Type.NUMBER },
              email: { type: Type.STRING },
              phone1: { type: Type.STRING },
              phone2: { type: Type.STRING },
              course: { type: Type.STRING, enum: COURSE_OPTIONS },
              photo: { type: Type.STRING },
            },
            required: ["id", "name", "age", "email", "phone1", "phone2", "course"],
          },
        },
      },
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error al generar estudiantes con Gemini:", error);
    throw error;
  }
};

/**
 * Refina y corrige los datos de los estudiantes existentes
 */
export const refineStudentData = async (students: Student[]): Promise<Student[]> => {
  if (students.length === 0) return students;

  const prompt = `Actúa como un editor de datos. Limpia y profesionaliza los nombres, 
  corrige formatos de email y asegura que los datos en este JSON sean consistentes: 
  ${JSON.stringify(students)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const refinedData = JSON.parse(response.text());
    
    // Si la IA devuelve un objeto en lugar de un array, intentamos extraer la lista
    return Array.isArray(refinedData) ? refinedData : students;
  } catch (error) {
    console.error("Error al refinar datos con Gemini:", error);
    return students;
  }
};

export const refineStudentData = async (students: Student[]): Promise<Student[]> => {
  if (!ai) return students;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Limpia y profesionaliza los nombres y datos de este JSON de estudiantes: ${JSON.stringify(students)}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || JSON.stringify(students));
  } catch (error) {
    return students;
  }
};
