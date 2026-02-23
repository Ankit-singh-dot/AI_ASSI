import { config } from 'dotenv';
config();
import { prisma } from './lib/prisma';
async function main() {
  const int = await prisma.integration.findFirst({ where: { platform: 'instagram' } });
  console.log("META:", int?.metadata);
}
main().catch(console.error);
