import { PrismaClient, UserRole, EventCategory, TicketTypeCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@onentree.com.br' },
    update: {},
    create: {
      name: 'Administrador OnEntrée',
      email: 'admin@onentree.com.br',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`  ✅ Usuário admin: ${admin.email} / senha: admin123`);

  // Locais
  const morumbis = await prisma.venue.upsert({
    where: { id: 'seed-morumbis' },
    update: {},
    create: {
      id: 'seed-morumbis',
      name: 'Morumbis',
      capacity: 67052,
      address: 'Avenida Francisco Matarazzo, 1705',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05001-900',
      email: 'contato@morumbis.com.br',
      phone: '(11) 3058-8000',
    },
  });

  const allianz = await prisma.venue.upsert({
    where: { id: 'seed-allianz' },
    update: {},
    create: {
      id: 'seed-allianz',
      name: 'Allianz Parque',
      capacity: 43713,
      address: 'Avenida Francisco Matarazzo, 1705',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05001-900',
      email: 'ir@chakra-ui.com',
      phone: '(11) 3058-8000',
    },
  });

  const neoQuimica = await prisma.venue.upsert({
    where: { id: 'seed-neoquimica' },
    update: {},
    create: {
      id: 'seed-neoquimica',
      name: 'Neo Química Arena',
      capacity: 47252,
      address: 'Avenida Francisco Matarazzo, 1705',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05001-900',
      email: 'ir@chakra-ui.com',
      phone: '(11) 3058-8000',
    },
  });
  console.log(`  ✅ Locais: ${morumbis.name}, ${allianz.name}, ${neoQuimica.name}`);

  // Portões
  const gatesData = [
    { venueId: morumbis.id, name: 'Portão A', identifier: 'A' },
    { venueId: morumbis.id, name: 'Portão B', identifier: 'B' },
    { venueId: morumbis.id, name: 'Portão C', identifier: 'C' },
    { venueId: morumbis.id, name: 'Portão D', identifier: 'D' },
    { venueId: morumbis.id, name: 'Portão E', identifier: 'E' },
    { venueId: morumbis.id, name: 'Portão F', identifier: 'F' },
    { venueId: morumbis.id, name: 'Portão G', identifier: 'G' },
    { venueId: morumbis.id, name: 'Portão H', identifier: 'H' },
    { venueId: morumbis.id, name: 'Portão I', identifier: 'I' },
    { venueId: morumbis.id, name: 'Portão J', identifier: 'J' },
    { venueId: morumbis.id, name: 'Portão K', identifier: 'K' },
    { venueId: allianz.id, name: 'Portão 3', identifier: '3' },
    { venueId: allianz.id, name: 'Portão 4', identifier: '4' },
    { venueId: allianz.id, name: 'Portão 5', identifier: '5' },
    { venueId: allianz.id, name: 'Portão 6', identifier: '6' },
    { venueId: allianz.id, name: 'Portão 7', identifier: '7' },
    { venueId: allianz.id, name: 'Portão 8', identifier: '8' },
    { venueId: allianz.id, name: 'Portão 9', identifier: '9' },
    { venueId: allianz.id, name: 'Portão 10', identifier: '10' },
  ];
  for (const g of gatesData) {
    await prisma.gate.upsert({
      where: { venueId_identifier: { venueId: g.venueId, identifier: g.identifier } },
      update: {},
      create: g,
    });
  }
  console.log(`  ✅ ${gatesData.length} portões criados`);

  // Tipos de ingresso
  const inteira = await prisma.ticketType.upsert({
    where: { id: 'seed-inteira' },
    update: {},
    create: { id: 'seed-inteira', name: 'Inteira', category: TicketTypeCategory.INTEIRA, price: 120.0 },
  });
  const vip = await prisma.ticketType.upsert({
    where: { id: 'seed-vip' },
    update: {},
    create: { id: 'seed-vip', name: 'VIP', category: TicketTypeCategory.VIP, price: 500.0 },
  });
  console.log(`  ✅ Tipos de ingresso: ${inteira.name}, ${vip.name}`);

  // Eventos
  const hoje = new Date();
  const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
  const depois = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

  const evento1 = await prisma.event.upsert({
    where: { id: 'seed-evento-1' },
    update: {},
    create: {
      id: 'seed-evento-1',
      name: 'Final Copa América',
      category: EventCategory.FUTEBOL,
      venueId: morumbis.id,
      startDate: new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate(), 17, 0, 0),
      endDate: new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate(), 21, 0, 0),
      createdById: admin.id,
    },
  });
  const evento2 = await prisma.event.upsert({
    where: { id: 'seed-evento-2' },
    update: {},
    create: {
      id: 'seed-evento-2',
      name: 'Semi Final Copa América',
      category: EventCategory.FUTEBOL,
      venueId: morumbis.id,
      startDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 20, 0, 0),
      endDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 0, 0),
      createdById: admin.id,
    },
  });
  const evento3 = await prisma.event.upsert({
    where: { id: 'seed-evento-3' },
    update: {},
    create: {
      id: 'seed-evento-3',
      name: 'Love on tour - Harry Styles',
      category: EventCategory.SHOW,
      venueId: morumbis.id,
      startDate: new Date(depois.getFullYear(), depois.getMonth(), depois.getDate(), 21, 0, 0),
      endDate: new Date(depois.getFullYear(), depois.getMonth(), depois.getDate(), 23, 30, 0),
      createdById: admin.id,
    },
  });
  console.log(`  ✅ Eventos: ${evento1.name}, ${evento2.name}, ${evento3.name}`);
  console.log('✅ Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
