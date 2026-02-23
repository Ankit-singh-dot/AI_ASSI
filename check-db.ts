import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ints = await prisma.integration.findMany({ where: { platform: 'gmail' } })
  console.log(ints)
}
main().catch(console.error)
