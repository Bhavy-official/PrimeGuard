import type { Prisma, RefreshToken } from "@prisma/client";

import { prisma } from "../config/prisma";

export const refreshTokenRepository = {
  create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  },

  revokeById(
    id: string,
    data: Pick<RefreshToken, "revokedAt" | "replacedById">,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data,
    });
  },

  revokeByTokenHash(tokenHash: string, revokedAt: Date): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  },
};
