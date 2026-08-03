import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.pricingAudit.createMany({
    data: [
      {
        name: 'Logitech MX Master 3S Wireless Mouse',
        sku: 'LOGI-MX3S-BLK',
        supplier: 'TechData',
        wholesaleCost: 65.00,
        oldPrice: 89.99,
        newPrice: 99.99,
        status: 'synced',
      },
      {
        name: 'Samsung 980 PRO 1TB PCIe NVMe Gen4 SSD',
        sku: 'SAM-980P-1TB',
        supplier: 'Synnex',
        wholesaleCost: 75.00,
        oldPrice: 109.99,
        newPrice: 119.99,
        status: 'pending',
      },
      {
        name: 'Corsair Vengeance LPX 32GB (2X16GB) DDR4',
        sku: 'COR-VEN-32G',
        supplier: 'Ingram Micro',
        wholesaleCost: 55.00,
        oldPrice: 85.99,
        newPrice: 79.99,
        status: 'synced',
      },
      {
        name: 'AMD Ryzen 7 5800X 8-Core Processor',
        sku: 'AMD-R7-5800X',
        supplier: 'TechData',
        wholesaleCost: 195.00,
        oldPrice: 249.99,
        newPrice: 229.99,
        status: 'error',
      },
    ],
  });
  console.log('Dummy PricingAudit records seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
