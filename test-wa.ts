import { config } from 'dotenv';
config();
import { prisma } from './lib/prisma';
async function main() {
    await prisma.integration.updateMany({ 
        where: { platform: 'whatsapp' },
        data: { status: 'connected', metadata: { phoneNumberId: '123456789_phoneId' } } 
    });
}
main().catch(console.error);
