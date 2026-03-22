import request from './client';

// 学习统计总览 - 匹配后端 LearningStatsVO
export interface LearningStatsOverview {
  totalGoals: number;
  totalPoints: number;
  totalSessions: number;
  totalDuration: number; // 秒
  masteredPoints: number;
  learningPoints: number;
  notStartedPoints: number;
}

// 进度数据点 - 匹配后端 ProgressDataPoint
export interface ProgressDataPoint {
  recordTime: string;
  beforeLevel: number;
  afterLevel: number;
  pointTitle: string;
  pointId: string;
  sessionDuration: number; // 秒
}

// 学习进度曲线 - 匹配后端 ProgressCurveVO
export interface ProgressCurve {
  dataPoints: ProgressDataPoint[];
  startDate: string;
  endDate: string;
}

// 获取学习总览
export function getLearningStatsOverview(): Promise<LearningStatsOverview> {
  return request.get('/learning-stats/overview');
}

// 获取学习进度曲线
export function getProgressCurve(params?: {
  goalId?: string;
  days?: number;
}): Promise<ProgressCurve> {
  return request.get('/learning-stats/progress', { params });
}
