import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, AlertCircle, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: {
    is_premium?: boolean;
    is_admin?: boolean;
  };
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.is_admin) {
        navigate('/dashboard');
        return;
      }
      loadUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sync users first
      await supabase.rpc('sync_admin_users');

      // Then get the data
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleConfirmEmail = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('confirm_user_email', {
        user_id: userId
      });

      if (error) throw error;

      setSuccessMessage('Email confirmado correctamente');
      await loadUsers();
    } catch (error: any) {
      console.error('Error confirming email:', error);
      setError(error.message || 'Error al confirmar email');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${email}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) throw error;

      setSuccessMessage('Usuario eliminado correctamente');
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !users.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 
                   rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 
                     focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email_confirmed_at ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at ? 
                      new Date(user.last_sign_in_at).toLocaleDateString() : 
                      'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.user_metadata?.is_admin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                      {user.user_metadata?.is_premium && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Premium
                        </span>
                      )}
                      {!user.user_metadata?.is_premium && !user.user_metadata?.is_admin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Free
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {!user.email_confirmed_at && (
                        <button
                          onClick={() => handleConfirmEmail(user.id)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          Confirmar email
                        </button>
                      )}
                      {!user.user_metadata?.is_admin && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;