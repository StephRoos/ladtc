import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Seed the database with initial data:
 * - Admin user
 * - Sample products
 */
async function main(): Promise<void> {
  console.log("Seeding database...");

  // --- Admin user ---
  const adminEmail = "admin@ladtc.be";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin LADTC",
        emailVerified: true,
        role: "ADMIN",
        accounts: {
          create: {
            accountId: crypto.randomUUID(),
            providerId: "credential",
            password: "$2b$10$placeholder_hash_change_via_app", // Use the app to set a real password
          },
        },
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // --- Sample products ---
  const sampleProducts = [
    {
      name: "Maillot technique LADTC",
      description: "Maillot de running technique aux couleurs du club. Tissu respirant et léger.",
      price: 25.0,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      stock: 50,
      sku: "LADTC-MAILLOT-001",
      active: true,
    },
    {
      name: "Short running LADTC",
      description: "Short de running avec poche zippée et doublure intégrée.",
      price: 22.0,
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 30,
      sku: "LADTC-SHORT-001",
      active: true,
    },
    {
      name: "Veste trail LADTC",
      description: "Veste légère coupe-vent pour le trail et les entraînements par temps frais.",
      price: 65.0,
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 20,
      sku: "LADTC-VESTE-001",
      active: true,
    },
    {
      name: "Bonnet LADTC",
      description: "Bonnet en polaire aux couleurs du club. Idéal pour les sorties hivernales.",
      price: 12.0,
      sizes: ["Unique"],
      stock: 40,
      sku: "LADTC-BONNET-001",
      active: true,
    },
    {
      name: "Chaussettes LADTC",
      description: "Chaussettes de running techniques avec renfort au talon et à la pointe.",
      price: 8.0,
      sizes: ["36-38", "39-42", "43-46"],
      stock: 60,
      sku: "LADTC-CHAUSSETTES-001",
      active: true,
    },
  ];

  for (const product of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      const created = await prisma.product.create({ data: product });
      console.log(`Created product: ${created.name}`);
    } else {
      console.log(`Product already exists: ${product.name}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
