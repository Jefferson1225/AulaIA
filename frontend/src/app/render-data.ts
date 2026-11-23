import "server-only";
import { cache } from "react";
import { requireContentAdmin } from "@aulaia/backend/infrastructure/supabase/admin-access";
import { requireLearningUser } from "@aulaia/backend/infrastructure/supabase/learning-access";
import { getProfile } from "@aulaia/backend/infrastructure/supabase/profile-repository";

// El layout y sus páginas comparten estas lecturas dentro de una misma renderización.
export const requireStudentForRender = cache(requireLearningUser);
export const requireAdminForRender = cache(requireContentAdmin);
export const getProfileForRender = cache(getProfile);
