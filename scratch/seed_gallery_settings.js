const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { key: 'gallery_badge_text', value: 'Visual Feast' },
    { key: 'gallery_heading', value: 'Explore Our Signature Dishes' },
    { key: 'gallery_subtitle', value: 'Explore our signature dishes at our restaurants - Malabari Restaurant, Frij Al Murar, Naif, Dubai. Al Shamil Restaurants & Cafeteria, Madina Mall Food Court & Premium Chef Restaurant, Near Galadari Driving Centre - Al Qusais Industrial Area 4 - Dubai' }
  ];

  for (const item of defaults) {
    await prisma.setting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value }
    });
  }
  console.log('Gallery headers seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
