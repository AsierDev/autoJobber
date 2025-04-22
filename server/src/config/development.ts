/**
 * Configuración específica para entorno de desarrollo
 */
export default {
  // Habilitar módulos simulados para desarrollo
  enableMocks: true,
  
  // Usar un usuario de prueba para desarrollo
  mockUserId: '00000000-0000-0000-0000-000000000000',
  
  // Configuración de base de datos para desarrollo (opcional si ya se define en .env)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'autojobber_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: console.log,
  },
  
  // Configuración de token JWT para desarrollo
  jwt: {
    secret: process.env.JWT_SECRET || 'development_jwt_secret_key',
    expiresIn: '7d',
  },
  
  // Configuración simulada de S3 para pruebas
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'autojobber-dev',
    region: process.env.AWS_REGION || 'us-east-1',
  },
  
  // URL para el servicio de IA
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  }
}; 