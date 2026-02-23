import { config } from 'dotenv';
config();
import { prisma } from './lib/prisma';
async function main() {
  const int = await prisma.integration.findFirst({ where: { platform: 'website_forms' } });
  console.log("SECRET:", int?.webhookSecret);
}
main().catch(console.error);
