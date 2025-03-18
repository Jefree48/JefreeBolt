import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingCart, FileText, Download, Loader2, Settings } from 'lucide-react';
import { generateMenuPlan, generateShoppingList, estimateShoppingCost } from '../lib/openai';
import { supabase, getUserPreferences } from '../lib/supabase';
import { generatePDF } from '../lib/pdf';
import { pdfLimiter } from '../lib/rateLimiter';
import PreferencesModal from '../components/PreferencesModal';
import UpgradeModal from '../components/UpgradeModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserPreferences {
  family_size: number;
  ages: string | null;
  dietary_restrictions: string | null;
  food_preferences: string | null;
  menu_days: number;
}

const getRandomMessage = (type: 'success' | 'error') => {
  const messages = {
    success: [
      '¡Listo! ¿Hay algo más en lo que pueda ayudarte?',
      '¡Perfecto! ¿Necesitas algo más?',
      '¡Ya está! ¿Qué más puedo hacer por ti?'
    ],
    error: [
      'Vaya... ha habido un problema. ¿Intentamos de nuevo?',
      'Lo siento, algo no ha salido bien. ¿Probamos otra vez?',
      'Ha ocurrido un error. ¿Me dejas intentarlo de nuevo?'
    ]
  };
  return messages[type][Math.floor(Math.random() * messages[type].length)];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '¡Hola! 👋 Soy tu asistente personal de cocina. ¿Qué te apetece preparar hoy?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [menuPlan, setMenuPlan] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<string | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/login');
        return;
      }

      setUser(user);
      await loadUserPreferences(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    }
  };

  const loadUserPreferences = async (userId: string) => {
    try {
      const prefs = await getUserPreferences(userId);
      if (!prefs) {
        navigate('/onboarding');
        return;
      }
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, no pude cargar tus preferencias. ¿Podrías intentar recargar la página?'
      }]);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleGenerateMenuPlan = async () => {
    if (!preferences || !user) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '¡Hola! 👋 Necesito conocer tus preferencias antes de generar un menú. ¿Qué tal si las configuramos?'
      }]);
      return;
    }

    if (preferences.menu_days > 3 && !user?.user_metadata?.is_premium) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Para generar menús de más de 3 días necesitas la versión Premium. ¡Son solo 0,99€ al mes!'
      }]);
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '¡Voy a ello! Dame un momentito...' 
    }]);

    try {
      const plan = await generateMenuPlan({
        familySize: preferences.family_size,
        ages: preferences.ages || '',
        dietaryRestrictions: preferences.dietary_restrictions || '',
        foodPreferences: preferences.food_preferences || '',
        menuDays: preferences.menu_days
      }, user.id);

      setMenuPlan(plan);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: plan },
        { role: 'assistant', content: '¿Te gustaría que te prepare también la lista de la compra?' }
      ]);
    } catch (error: any) {
      console.error('Error generating menu plan:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message || 'No pude crear el menú. ¿Intentamos de nuevo?' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!menuPlan || !user) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Primero necesito generar un plan de menú. ¿Quieres que lo haga ahora?' 
      }]);
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '¡Voy a preparar tu lista de compra!' 
    }]);

    try {
      const list = await generateShoppingList(menuPlan, user.id);
      setShoppingList(list);

      // Generate cost estimate
      try {
        const estimate = await estimateShoppingCost(list, user.id);
        setCostEstimate(estimate);
      } catch (error) {
        console.error('Error generating cost estimate:', error);
        // Continue without cost estimate
      }

      setMessages(prev => [...prev, 
        { role: 'assistant', content: list },
        { role: 'assistant', content: '¿Necesitas algo más?' }
      ]);
    } catch (error: any) {
      console.error('Error generating shopping list:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message || 'Tuve un problema al crear la lista. ¿Lo intentamos de nuevo?' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!menuPlan && !shoppingList || !user) return;

    try {
      setLoading(true);

      // Check download limits for free users
      if (!user.user_metadata?.is_premium) {
        const canDownload = await pdfLimiter.checkLimit(user.id);
        if (!canDownload) {
          throw new Error('Has alcanzado el límite de descargas diarias. ¡Actualiza a Premium para descargas ilimitadas!');
        }
      }

      const doc = await generatePDF(user.id, {
        menuPlan,
        shoppingList,
        costEstimate,
        userName: user.email.split('@')[0],
        isPremium: user?.user_metadata?.is_premium
      });

      // Increment download count for free users
      if (!user.user_metadata?.is_premium) {
        await pdfLimiter.incrementDownloads(user.id);
      }

      doc.save('plan-semanal.pdf');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getRandomMessage('success')
      }]);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message || getRandomMessage('error')
      }]);

      if (error.message?.includes('límite de descargas')) {
        setShowUpgradeModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    if (userMessage.toLowerCase().includes('menú') || userMessage.toLowerCase().includes('menu')) {
      await handleGenerateMenuPlan();
    } else if (userMessage.toLowerCase().includes('compra') || userMessage.toLowerCase().includes('lista')) {
      await handleGenerateShoppingList();
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '¿Te gustaría que te ayude a planificar el menú o crear una lista de la compra?'
      }]);
    }
  };

  if (loadingPreferences) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Cargando tus preferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tu Asistente Personal</h2>
                <p className="text-gray-600">¡Pregúntame lo que quieras! 😊</p>
              </div>
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="p-2 text-gray-600 hover:text-purple-600 rounded-lg hover:bg-gray-100"
                title="Editar preferencias"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
            
            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={handleGenerateMenuPlan}
                  disabled={loading || !preferences}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg 
                           hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Generar Plan de Menú</span>
                  </div>
                </button>
                <button
                  onClick={handleGenerateShoppingList}
                  disabled={loading || !menuPlan}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg 
                           hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Generar Lista de Compra</span>
                  </div>
                </button>
                <button
                  onClick={handleExportToPDF}
                  disabled={(!menuPlan && !shoppingList) || loading}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg 
                           hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Exportar a PDF</span>
                  </div>
                </button>
              </div>
            </div>

            {preferences && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Tus Preferencias</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Familia: {preferences.family_size} personas</p>
                  {preferences.ages && <p>Edades: {preferences.ages}</p>}
                  {preferences.dietary_restrictions && (
                    <p>Restricciones: {preferences.dietary_restrictions}</p>
                  )}
                  {preferences.food_preferences && (
                    <p>Preferencias: {preferences.food_preferences}</p>
                  )}
                  <p>Días de menú: {preferences.menu_days}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        currentPreferences={preferences!}
        onUpdate={() => loadUserPreferences(user?.id)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default Dashboard;