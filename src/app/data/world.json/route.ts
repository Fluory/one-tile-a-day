import { getWorld } from '@/features/world-data';

export const dynamic = 'force-static';

/** The island for the browser (3D scene and map), cached with every deployment. */
export function GET() {
  return Response.json(getWorld());
}
