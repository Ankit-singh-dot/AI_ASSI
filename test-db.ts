import { config } from 'dotenv';
config();
import { prisma } from './lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return console.log("No users");
  const user = users[0];
  console.log("User:", user.email);

  const ints = await prisma.integration.findMany({ where: { userId: user.id } });
  console.log("Integrations:", ints.map(i => ({ platform: i.platform, status: i.status, metadata: i.metadata })));
}
main().catch(console.error);
