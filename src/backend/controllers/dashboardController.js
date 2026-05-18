import { getDashboardStats, getCandidateMatches } from "../services/dashboardService.js";

export async function getStatsHandler(req, res, next) {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export async function getCandidateMatchesHandler(req, res, next) {
  try {
    const matches = await getCandidateMatches();
    res.json(matches);
  } catch (error) {
    next(error);
  }
}
