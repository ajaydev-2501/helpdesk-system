import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed structure prepared for future admin and user test accounts.
 *
 * NOTE: Passwords in production and authenticated workflows will be hashed
 * using bcrypt. For initial seeding structure, pre-calculated bcrypt hashes
 * or placeholder hashes are configured here without embedding plaintext passwords.
 */
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seed infrastructure...');

  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const userPasswordHash = await bcrypt.hash('User@123456', 10);

  // Default test accounts
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.local' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@helpdesk.local',
      name: 'System Administrator',
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'user@helpdesk.local' },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
    create: {
      email: 'user@helpdesk.local',
      name: 'Test Customer User',
      role: Role.USER,
      passwordHash: userPasswordHash,
    },
  });

  console.log(`✅ Seeded admin: ${adminUser.email} (Admin@123456)`);
  console.log(`✅ Seeded user: ${customerUser.email} (User@123456)`);

  // Seed sample tickets for customer
  const sampleTickets = [
    {
      title: 'Database connection latency spike in EU region',
      description: 'The primary PostgreSQL read replica is experiencing 600ms latency during peak business hours. Please investigate the connection pool configuration.',
      category: 'Infrastructure',
      priority: 'HIGH' as const,
      status: 'OPEN' as const,
      userId: customerUser.id,
    },
    {
      title: 'Billing statement missing VAT number for September',
      description: 'Our finance team noticed invoice #INV-2026-09 did not include our registered tax ID number. Please re-issue.',
      category: 'Billing',
      priority: 'MEDIUM' as const,
      status: 'IN_PROGRESS' as const,
      userId: customerUser.id,
    },
    {
      title: 'Request SAML 2.0 Single Sign-On integration',
      description: 'We would like to configure Okta SSO for our organization workspace so team members can authenticate seamlessly.',
      category: 'Features',
      priority: 'LOW' as const,
      status: 'RESOLVED' as const,
      userId: customerUser.id,
    },
  ];

  for (const t of sampleTickets) {
    const existing = await prisma.ticket.findFirst({
      where: { title: t.title, userId: t.userId },
    });
    if (!existing) {
      await prisma.ticket.create({ data: t });
    }
  }

  console.log('✅ Seeded initial demo support tickets.');

  console.log('✨ Seed infrastructure executed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
