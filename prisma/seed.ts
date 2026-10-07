// Crea o actualiza el primer ADMIN desde variables de entorno. No hay credenciales por defecto.
import { PrismaClient } from "@prisma/client";
import { ScryptPasswordHasher, MIN_PASSWORD_LENGTH } from "../src/infrastructure/auth/scrypt-password-hasher";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrador";

  if (!email || !email.includes("@") || email.startsWith("<")) {
    throw new Error("Define SEED_ADMIN_EMAIL con un correo valido.");
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.startsWith("<")) {
    throw new Error(`Define SEED_ADMIN_PASSWORD (minimo ${MIN_PASSWORD_LENGTH} caracteres).`);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await new ScryptPasswordHasher().hash(password);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, name, role: "ADMIN", isActive: true, failedLoginCount: 0, lockedUntil: null },
      create: { email, name, role: "ADMIN", passwordHash }
    });
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "seed.admin_upserted", entity: "User", entityId: user.id }
    });
    console.log(`ADMIN listo: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
