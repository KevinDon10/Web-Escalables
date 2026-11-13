import mongoose from 'mongoose';
import { getConfig } from '../config/env.ts';
import { connectDatabase } from '../config/database.ts';
import { hashPassword } from '../helpers/password.ts';
import { BarberModel } from '../models/barber.model.ts';
import { ServiceModel } from '../models/service.model.ts';
import { UserModel } from '../models/user.model.ts';
import { getBusinessSettings } from '../services/schedule.service.ts';

const services = [
  { nombre: 'Corte clásico', descripcion: 'Un corte preciso y personalizado para un estilo impecable.', precio: 250, duracion: 45, imagen: '/img/servicio-corte.png', categoria: 'Corte', activo: true },
  { nombre: 'Arreglo de barba', descripcion: 'Perfilado con navaja, toalla caliente y aceites nutritivos.', precio: 180, duracion: 30, imagen: '/img/servicio-barba.png', categoria: 'Barba', activo: true },
  { nombre: 'Corte + barba', descripcion: 'La combinación perfecta para renovar tu look completo.', precio: 380, duracion: 75, imagen: '/img/servicio-combo.png', categoria: 'Paquete', activo: true },
  { nombre: 'Tratamiento facial', descripcion: 'Limpieza profunda y cuidado revitalizante para tu piel.', precio: 320, duracion: 50, imagen: '/img/servicio-Tratamiento-Facial.png', categoria: 'Cuidado', activo: true },
  { nombre: 'Tinte y estilo', descripcion: 'Color aplicado con precisión para un resultado natural.', precio: 450, duracion: 60, imagen: '/img/servicio-tinte.png', categoria: 'Color', activo: true },
  { nombre: 'Experiencia spa', descripcion: 'Un momento de cuidado y relajación de principio a fin.', precio: 520, duracion: 80, imagen: '/img/servici-spa.png', categoria: 'Cuidado', activo: true }
];

const barbers = [
  { nombre: 'Isac Cutz', especialidad: 'Cortes clásicos', imagen: 'https://i.pravatar.cc/120?img=12', disponible: true },
  { nombre: 'Diego Herrera', especialidad: 'Barba y navaja', imagen: 'https://i.pravatar.cc/120?img=13', disponible: true },
  { nombre: 'Andrés ibarra', especialidad: 'Estilo contemporáneo', imagen: 'https://i.pravatar.cc/120?img=14', disponible: true }
];

async function seed(): Promise<void> {
  const config = getConfig();
  if (!config.ADMIN_NAME || !config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios para crear la cuenta administradora.');
  }
  await connectDatabase(config);

  const email = config.ADMIN_EMAIL.toLowerCase();
  const existingUser = await UserModel.findOne({ correo: email });
  if (existingUser && existingUser.role !== 'admin') {
    throw new Error('El correo configurado ya pertenece a un cliente y no se promoverá automáticamente a administrador.');
  }
  if (!existingUser) {
    await UserModel.create({
      nombre: config.ADMIN_NAME,
      apellidos: 'Administrador',
      correo: email,
      telefono: '0000000',
      password: await hashPassword(config.ADMIN_PASSWORD),
      role: 'admin'
    });
    console.log(`Cuenta administradora creada: ${email}`);
  } else {
    console.log(`La cuenta administradora ya existe: ${email}`);
  }

  for (const service of services) {
    await ServiceModel.updateOne({ nombre: service.nombre }, { $setOnInsert: service }, { upsert: true });
  }
  for (const barber of barbers) {
    await BarberModel.updateOne({ nombre: barber.nombre }, { $setOnInsert: barber }, { upsert: true });
  }
  await getBusinessSettings(config);
  console.log('Catálogo, barberos y horario inicial verificados.');
}

seed()
  .catch(error => {
    console.error('No se pudo completar el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
