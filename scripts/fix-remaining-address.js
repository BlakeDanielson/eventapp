const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRemainingAddress() {
  console.log('🔧 Fixing remaining fake address...');

  try {
    const result = await prisma.event.updateMany({
      where: {
        location: {
          contains: "321 Startup Way"
        }
      },
      data: {
        location: "Microsoft Technology Center, 1065 La Avenida, Mountain View, CA 94043"
      }
    });

    console.log(`✅ Updated ${result.count} event(s) with fake "Startup Way" address`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingAddress(); 