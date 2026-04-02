/**
 * Client-side session store for draft-specific data.
 *
 * Persists team members and project selection per tender across page navigations
 * within the same browser session (module-level singleton).
 *
 * TODO: Replace saveDraftTeam / saveDraftProjectSelection with
 *   POST /api/draft/:tenderId/team  and  POST /api/draft/:tenderId/projects
 * when the backend draft endpoint is available.
 */

import type { TeamMember } from '@/types';
import { MOCK_DRAFT_TEAM, MOCK_DRAFT_PROJECT_SELECTION } from '@/lib/mockData';

interface DraftData {
  teamMembers: TeamMember[];
  selectedProjectIds: string[];
}

// Module-level store — shared across all client component instances in the session.
const store: Record<string, DraftData> = {};

// Pre-seed with mock defaults so the demo flows end-to-end without backend.
for (const [tenderId, projectIds] of Object.entries(MOCK_DRAFT_PROJECT_SELECTION)) {
  store[tenderId] = {
    teamMembers: MOCK_DRAFT_TEAM as TeamMember[],
    selectedProjectIds: projectIds,
  };
}

export function getDraftData(tenderId: string): DraftData {
  return store[tenderId] ?? { teamMembers: [], selectedProjectIds: [] };
}

// TODO: POST /api/draft/:tenderId/team { team_members: members }
export function saveDraftTeam(tenderId: string, members: TeamMember[]): void {
  store[tenderId] = { ...getDraftData(tenderId), teamMembers: members };
}

// TODO: POST /api/draft/:tenderId/projects { selected_project_ids: ids }
export function saveDraftProjectSelection(tenderId: string, ids: string[]): void {
  store[tenderId] = { ...getDraftData(tenderId), selectedProjectIds: ids };
}
