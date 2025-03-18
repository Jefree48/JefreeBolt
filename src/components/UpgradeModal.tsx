import React from 'react';
import { X, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Crown className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold">¡Actualiza a Premium!</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center space-y-4 mb-6">
          <p className="text-gray-600">
            ¡Desbloquea todas las funciones por solo 0,99€ al mes!
          </p>
          <ul className="text-left space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Menús de hasta 14 días
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Listas de compra ilimitadas
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Sin anuncios
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Soporte prioritario
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-gray-500"
          >
            Más tarde
          </button>
          <button
            onClick={() => {
              // TODO: Implement payment integration
              alert('¡Próximamente disponible!');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-purple-500"
          >
            Actualizar ahora - 0,99€/mes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;