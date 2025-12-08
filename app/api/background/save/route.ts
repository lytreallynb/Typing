import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl, opacity } = await request.json();

  if (opacity !== null && opacity !== undefined && (typeof opacity !== "number" || opacity < 0 || opacity > 1)) {
    return NextResponse.json({ error: "Opacity must be between 0 and 1." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      backgroundImage: imageUrl ?? null,
      backgroundOpacity: opacity ?? null,
    },
    select: {
      backgroundImage: true,
      backgroundOpacity: true,
    },
  });

  return NextResponse.json({ background: user });
}
