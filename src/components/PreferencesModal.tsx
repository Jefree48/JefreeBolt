import React, { useState } from 'react';
import { X, Crown } from 'lucide-react';
import { supabase, updateUserPreferences } from '../lib/supabase';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: {
    family_size: number;
    ages: string | null;
    dietary_restrictions: string | null;
    food_preferences: string | null;
    menu_days: number;
  };
  onUpdate: () => void;
}

const PreferencesModal = ({ isOpen, onClose, currentPreferences, onUpdate }: PreferencesModalProps) => {
  const [preferences, setPreferences] = useState(currentPreferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowUpgradePrompt(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No se encontró el usuario. Por favor, inicia sesión de nuevo.');
        return;
      }

      // Validate preferences
      if (preferences.family_size < 1) {
        setError('El tamaño de la familia debe ser al menos 1');
        return;
      }

      if (preferences.menu_days < 1) {
        setError('Los días del menú deben ser al menos 1');
        return;
      }

      await updateUserPreferences(user.id, {
        family_size: preferences.family_size,
        ages: preferences.ages || null,
        dietary_restrictions: preferences.dietary_restrictions || null,
        food_preferences: preferences.food_preferences || null,
        menu_days: preferences.menu_days
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      if (error.message === 'premium_required') {
        setShowUpgradePrompt(true);
        setPreferences(prev => ({ ...prev, menu_days: 3 })); // Reset to free plan limit
      } else {
        setError('No se pudieron actualizar las preferencias. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Preferencias</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {showUpgradePrompt && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="font-semibold text-purple-900">¡Actualiza a Premium!</h3>
            </div>
            <p className="text-sm text-purple-700 mb-2">
              Para acceder a menús de más de 3 días, actualiza a la versión Premium por solo 0,99€/mes.
            </p>
            <button
              onClick={() => {
                // TODO: Implement payment integration
                alert('¡Próximamente disponible!');
              }}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Actualizar ahora →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño de la familia
            </label>
            <input
              type="number"
              min="1"
              value={preferences.family_size}
              onChange={(e) => setPreferences({...preferences, family_size: parseInt(e.target.value) || 1})}
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edades
            </label>
            <input
              type="text"
              value={preferences.ages || ''}
              onChange={(e) => setPreferences({...preferences, ages: e.target.value})}
              placeholder="Ej: 35, 32, 5, 3"
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500">Separa las edades con comas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restricciones alimentarias
            </label>
            <textarea
              value={preferences.dietary_restrictions || ''}
              onChange={(e) => setPreferences({...preferences, dietary_restrictions: e.target.value})}
              placeholder="Ej: Celiaquía, intolerancia a la lactosa..."
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferencias alimentarias
            </label>
            <textarea
              value={preferences.food_preferences || ''}
              onChange={(e) => setPreferences({...preferences, food_preferences: e.target.value})}
              placeholder="Ej: Vegetariano, sin pescado..."
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de menú
            </label>
            <select
              value={preferences.menu_days}
              onChange={(e) => setPreferences({...preferences, menu_days: parseInt(e.target.value)})}
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={1}>1 día</option>
              <option value={3}>3 días</option>
              <option value={7}>1 semana (Premium)</option>
              <option value={14}>2 semanas (Premium)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Plan gratuito: hasta 3 días. Plan Premium: hasta 14 días.
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg 
                       hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;