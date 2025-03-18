import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Apple, AlertTriangle, Loader2 } from 'lucide-react';

interface UserPreferences {
  familySize: number;
  ages: string;
  dietaryRestrictions: string;
  foodPreferences: string;
  menuDays: number;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    familySize: 1,
    ages: '',
    dietaryRestrictions: '',
    foodPreferences: '',
    menuDays: 3
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/login');
        return;
      }

      // Check if user already has preferences
      const { data: existingPreferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPreferences) {
        navigate('/dashboard');
      } else if (prefError && prefError.code !== 'PGRST116') {
        throw prefError;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/login');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No se ha encontrado usuario');
      }

      const { error: insertError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          family_size: preferences.familySize,
          ages: preferences.ages || null,
          dietary_restrictions: preferences.dietaryRestrictions || null,
          food_preferences: preferences.foodPreferences || null,
          menu_days: preferences.menuDays
        });

      if (insertError) throw insertError;
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setError('Ha ocurrido un error al guardar tus preferencias. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ¿Cuántas personas son en la familia?
              </label>
              <input
                type="number"
                min="1"
                value={preferences.familySize}
                onChange={(e) => setPreferences({...preferences, familySize: parseInt(e.target.value) || 1})}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Edades de los miembros
              </label>
              <input
                type="text"
                value={preferences.ages}
                onChange={(e) => setPreferences({...preferences, ages: e.target.value})}
                placeholder="Ej: 35, 32, 5, 3"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="mt-1 text-sm text-gray-500">Separa las edades con comas</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ¿Hay alguna restricción alimentaria o intolerancia?
              </label>
              <textarea
                value={preferences.dietaryRestrictions}
                onChange={(e) => setPreferences({...preferences, dietaryRestrictions: e.target.value})}
                placeholder="Ej: Celiaquía, intolerancia a la lactosa..."
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferencias alimentarias
              </label>
              <textarea
                value={preferences.foodPreferences}
                onChange={(e) => setPreferences({...preferences, foodPreferences: e.target.value})}
                placeholder="Ej: Vegetariano, sin pescado..."
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={3}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ¿Para cuántos días quieres planificar los menús?
              </label>
              <select
                value={preferences.menuDays}
                onChange={(e) => setPreferences({...preferences, menuDays: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value={1}>1 día</option>
                <option value={3}>3 días</option>
                <option value={7}>1 semana</option>
                <option value={14}>2 semanas</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`w-3 h-3 rounded-full ${
                step >= number ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Configura tu perfil
          </h2>
          <p className="mt-2 text-gray-600">
            Ayúdanos a personalizar tu experiencia
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mt-8">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
          )}
          
          <button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center"
          >
            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            {step === 3 ? (loading ? 'Guardando...' : 'Finalizar') : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;