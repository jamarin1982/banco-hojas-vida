import { getDashboardStats, getCandidateMatches, getCandidatoStats } from "../services/dashboardService.js";
import { getCandidatoStats as getCandidatoStatsSvc } from "../services/candidatoStatsService.js";

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

export async function getCandidatoStatsHandler(req, res, next) {
  try {
    const stats = await getCandidatoStatsSvc(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
