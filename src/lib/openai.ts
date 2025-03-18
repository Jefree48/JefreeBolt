import OpenAI from 'openai';
import { rateLimiter, tokenUsageStore } from './rateLimiter';

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing environment variable: VITE_OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Cache for conversations
const conversationCache = new Map<string, Array<{ role: string, content: string }>>();

const SYSTEM_PROMPT = `Eres un chef experto y nutricionista especializado en planificación de menús personalizados.
Tu objetivo es ayudar a crear planes de alimentación saludables y equilibrados, adaptados a cada familia.

PERSONALIDAD Y ESTILO:
- Sé amigable, cercano y empático
- Usa un tono conversacional natural y fluido
- Muestra entusiasmo y pasión por la cocina
- Sé proactivo en ofrecer sugerencias y consejos
- Haz preguntas relevantes para entender mejor las necesidades
- Usa emojis ocasionalmente para hacer la conversación más amena
- Adapta tu lenguaje al nivel de experiencia culinaria del usuario

CAPACIDADES PRINCIPALES:
1. Planificación de Menús:
   - Estructura clara por comidas (desayuno, almuerzo, comida, merienda, cena)
   - Porciones adaptadas al número de personas
   - Variedad de ingredientes y técnicas culinarias
   - Balance nutricional y opciones saludables
   - Respeto por restricciones dietéticas y preferencias
   - Sugerencias de bebidas y alternativas
   - Consejos de preparación y cocción

2. Listas de Compra:
   - Organización por categorías de alimentos
   - Cantidades específicas y unidades claras
   - Productos de temporada y alternativas
   - Sugerencias de marcas cuando sea relevante
   - Consejos de almacenamiento
   - Optimización de compras y ahorro

3. Consejos y Educación:
   - Técnicas de cocina y preparación
   - Información nutricional relevante
   - Conservación de alimentos
   - Planificación y organización
   - Trucos y consejos prácticos
   - Adaptaciones y sustituciones

REGLAS DE INTERACCIÓN:
1. Siempre pregunta para clarificar cuando haya ambigüedad
2. Ofrece explicaciones cuando introduzcas términos técnicos
3. Sugiere alternativas cuando detectes posibles problemas
4. Adapta las recetas según feedback y preferencias
5. Mantén un hilo conductor en la conversación
6. Anticípate a necesidades relacionadas
7. Proporciona contexto nutricional cuando sea relevante

ESTRUCTURA DE RESPUESTAS:
1. Para menús:
   - Organiza por días y comidas
   - Incluye porciones y tiempo estimado
   - Añade notas sobre preparación
   - Sugiere alternativas principales
   - Incluye consejos de planificación

2. Para listas de compra:
   - Agrupa por categorías
   - Especifica cantidades
   - Añade notas sobre selección
   - Sugiere alternativas
   - Incluye consejos de compra

3. Para consejos:
   - Explica el razonamiento
   - Proporciona ejemplos prácticos
   - Ofrece alternativas
   - Incluye tips adicionales
   - Relaciona con otros aspectos`;

// Function to handle user messages
export const handleUserMessage = async (
  message: string,
  userId: string,
  preferences?: {
    familySize?: number;
    ages?: string;
    dietaryRestrictions?: string;
    foodPreferences?: string;
  }
) => {
  try {
    await rateLimiter.consume(userId);

    // Get conversation history
    const conversationHistory = conversationCache.get(userId) || [];

    // Build system message with context
    const systemMessage = {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n${
        preferences ? 
        `PREFERENCIAS DEL USUARIO:
        - Familia de ${preferences.familySize} personas
        ${preferences.ages ? `- Edades: ${preferences.ages}` : ''}
        ${preferences.dietaryRestrictions ? `- Restricciones: ${preferences.dietaryRestrictions}` : ''}
        ${preferences.foodPreferences ? `- Preferencias: ${preferences.foodPreferences}` : ''}` 
        : ''
      }`
    };

    // Prepare messages for API
    const messages = [
      systemMessage,
      ...conversationHistory.slice(-5), // Keep last 5 messages for context
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Upgrade to GPT-4
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.3,
      frequency_penalty: 0.5,
      top_p: 0.9,
      stream: false
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No se pudo generar una respuesta');

    // Update conversation history
    conversationCache.set(userId, [
      ...conversationHistory,
      { role: "user", content: message },
      { role: "assistant", content: result }
    ].slice(-10)); // Keep last 10 messages

    await tokenUsageStore.incrementTokens(userId, response.usage?.total_tokens || 0);

    return result;
  } catch (error: any) {
    console.error('Error processing message:', error);
    
    if (error.status === 429) {
      throw new Error('Has alcanzado el límite de consultas. Por favor, espera unos minutos antes de intentarlo de nuevo.');
    }
    
    throw new Error('Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?');
  }
};

// Export other necessary functions
export const { generateMenuPlan, generateShoppingList, estimateShoppingCost } = {
  generateMenuPlan: async (preferences: any, userId: string) => {
    return handleUserMessage(
      `Necesito un menú detallado para ${preferences.menuDays} días considerando estas preferencias:
      - Somos ${preferences.familySize} personas
      ${preferences.ages ? `- Edades: ${preferences.ages}` : ''}
      ${preferences.dietaryRestrictions ? `- Restricciones: ${preferences.dietaryRestrictions}` : ''}
      ${preferences.foodPreferences ? `- Preferencias: ${preferences.foodPreferences}` : ''}
      
      Por favor, incluye:
      - Desayuno, almuerzo, comida, merienda y cena para cada día
      - Porciones adaptadas al número de personas
      - Alternativas para platos principales
      - Sugerencias de bebidas
      - Consejos de preparación cuando sea relevante`,
      userId,
      preferences
    );
  },

  generateShoppingList: async (menuPlan: string, userId: string) => {
    return handleUserMessage(
      `Necesito una lista de compra detallada y organizada para este menú:
      
      ${menuPlan}
      
      Por favor:
      - Organiza los ingredientes por categorías
      - Especifica cantidades exactas
      - Incluye alternativas cuando sea relevante
      - Añade notas sobre selección de productos
      - Sugiere productos de temporada cuando sea posible`,
      userId
    );
  },

  estimateShoppingCost: async (shoppingList: string, userId: string) => {
    return handleUserMessage(
      `¿Podrías darme una estimación detallada del coste de esta lista de compra?
      
      ${shoppingList}
      
      Por favor:
      - Proporciona un rango de precios aproximado
      - Sugiere alternativas más económicas si es posible
      - Incluye consejos para optimizar el presupuesto
      - Destaca productos donde se puede ahorrar
      - Menciona ofertas típicas o temporadas más económicas`,
      userId
    );
  }
};