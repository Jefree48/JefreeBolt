import { verifyEmailConfig } from '../lib/email';

async function verifyConfiguration() {
  console.log('🔍 Verificando configuración de email...\n');

  // Verificar configuración de Resend
  console.log('Verificando configuración de Resend:');
  const emailStatus = await verifyEmailConfig();
  
  if (emailStatus.success) {
    console.log('✅ Resend está correctamente configurado');
    console.log('Detalles:', emailStatus.response);
  } else {
    console.error('❌ Error en la configuración de Resend:', emailStatus.error);
    process.exit(1);
  }
}

verifyConfiguration().catch((error) => {
  console.error('Error durante la verificación:', error);
  process.exit(1);
});