import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ background: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      backgroundImage: true,
      backgroundOpacity: true,
    },
  });

  return NextResponse.json({ background: user });
}
