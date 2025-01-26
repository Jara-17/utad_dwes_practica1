import mongoose from 'mongoose';
import User from './src/models/User';
import { env } from './src/config/env.config';

async function checkUser() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(env.db_url);
    console.log('Conexión a la base de datos establecida');

    const userId = '6795eec4fd2c8f4aa3f7ca5f';

    // Buscar usuario por ID, incluyendo eliminados
    const userWithDeleted = await User.findById(userId);
    console.log('Usuario encontrado (incluyendo eliminados):', userWithDeleted);

    // Buscar usuario activo
    const user = await User.findOne({ _id: userId, isDeleted: false });
    console.log('Usuario activo:', user);

    // Listar todos los usuarios para verificar
    const allUsers = await User.find({});
    console.log('Total de usuarios:', allUsers.length);
    console.log('IDs de usuarios:', allUsers.map(u => u._id.toString()));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
