/**
 * Script para inicializar la base de datos en entorno de desarrollo
 * 
 * Ejecutar con: ts-node src/scripts/initDevDB.ts
 */
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

// Importar todos los modelos que queremos sincronizar
import User from '../models/User';
import Resume from '../models/Resume';
import JobPreference from '../models/JobPreference';

async function initDevDB() {
  console.log('Inicializando base de datos para desarrollo...');
  
  try {
    // Sincronizar todos los modelos (creará las tablas si no existen)
    await sequelize.sync({ force: true });
    console.log('Tablas creadas correctamente');
    
    // Crear usuario de prueba
    const testUser = await User.create({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123', // En producción, usar hash
      role: 'user',
    });
    console.log('Usuario de prueba creado con ID:', testUser.id);

    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión con la base de datos
    await sequelize.close();
  }
}

// Ejecutar la función
initDevDB(); 