import { getSimulation } from '@/features/world-data';

export const dynamic = 'force-static';

/** A simulated first year for the story section – labelled as simulation wherever it is shown. */
export function GET() {
  return Response.json(getSimulation());
}
