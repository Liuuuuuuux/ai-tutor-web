// 用户相关类型
export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 学习目标状态常量
export const LearningGoalStatus = {
  ACTIVE: 0, // 进行中
  COMPLETED: 1, // 已完成
  PAUSED: 2, // 暂停
} as const;

export type LearningGoalStatusType = (typeof LearningGoalStatus)[keyof typeof LearningGoalStatus];

// 学习目标 - 匹配后端 LearningGoalVO
export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: number; // 0-进行中，1-已完成，2-暂停
  progress: number;
  createTime: string;
  updateTime: string;
  knowledgePoints?: KnowledgePoint[];
  knowledgePointCount?: number;
}

// 创建学习目标请求
export interface CreateLearningGoalRequest {
  title: string;
  description: string;
}

// 知识点状态常量
export const KnowledgePointStatus = {
  NOT_STARTED: 0, // 未开始
  LEARNING: 1, // 学习中
  MASTERED: 2, // 已掌握
} as const;

export type KnowledgePointStatusType =
  (typeof KnowledgePointStatus)[keyof typeof KnowledgePointStatus];

// 知识点概览
export interface KnowledgePointOverview {
  id: string;
  pointId: string;
  content: string;
  createTime: string;
  updateTime: string;
}

// 知识点 - 匹配后端 KnowledgePointVO
export interface KnowledgePoint {
  id: string;
  goalId: string;
  title: string;
  description: string;
  sortOrder: number;
  status: number; // 0-未开始，1-学习中，2-已掌握
  masteryLevel: number; // 0-100
  materialSource?: string; // UPLOAD/SEARCH/BOTH
  lastLearnTime?: string;
  createTime: string;
  updateTime: string;
  overview?: KnowledgePointOverview; // 知识点概览
  // 前端扩展字段
  children?: KnowledgePoint[];
  level?: number;
}

// 学习会话状态常量
export const LearningSessionStatus = {
  IN_PROGRESS: 0, // 进行中
  COMPLETED: 1, // 已完成
} as const;

export type LearningSessionStatusType =
  (typeof LearningSessionStatus)[keyof typeof LearningSessionStatus];

// 学习会话 - 匹配后端 LearningSessionVO
export interface LearningSession {
  id: string;
  pointId: string;
  pointTitle?: string;
  mode: string; // TEACHING/COACH
  status: number; // 0-进行中，1-已完成
  openingMessage?: string;
  messages?: SessionMessage[];
  createTime: string;
}

// 会话消息（后端 MessageItem 结构）
export interface SessionMessage {
  role: 'USER' | 'ASSISTANT';
  content: string;
  createTime?: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  messageType?: 'EXPLANATION' | 'QUESTION' | 'ANSWER' | 'FEEDBACK';
  tokens?: number;
  createdAt: string;
}

// 学习资料 - 匹配后端 MaterialVO
export interface Material {
  id: string;
  goalId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  source: string; // UPLOAD/AI_SEARCH
  parseStatus: string; // PENDING/SUCCESS/FAILED
  parseError?: string;
  contentPreview?: string;
  pointIds?: string[];
  pointTitles?: string[];
  createTime: string;
}

// 创建资料请求（链接类型）
export interface CreateMaterialRequest {
  goalId: string;
  pointIds?: string[];
  title: string;
  url: string;
}

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

// 学习评估结果 - 匹配后端 LearningEvaluation
export interface LearningEvaluation {
  masteryScore: number; // 0-100
  gapsFound: string[];
  strengths: string[];
  suggestedReview: string[];
  encouragement?: string;
  nextTopic?: string;
}

// 会话完成结果 - 匹配后端 LearningSessionCompleteVO
export interface SessionCompleteResult {
  sessionId: string;
  evaluation: LearningEvaluation;
}

// AI 搜索结果
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

// AI 生成的知识点项
export interface GeneratedKnowledgePoint {
  title: string;
  description: string;
  difficulty?: string;
  estimatedTime?: string;
}

// 题目选项 - 匹配后端 QuestionOptionVO
export interface QuestionOption {
  id: string;
  optionKey: string; // A/B/C/D
  content: string;
}

// 题目 - 匹配后端 QuestionVO
export interface Question {
  id: string;
  originId?: string;
  type: string;
  difficulty?: string;
  question: string;
  answer: string;
  analysis?: string;
  score: number;
  questionOrder?: number;
  options?: QuestionOption[];
}

// 试卷 - 匹配后端 ExamPaperVO
export interface ExamPaper {
  id: string;
  examTitle: string;
  description?: string;
  status: number; // 0-草稿, 1-已发布, 2-已关闭
  totalScore: number;
  duration: number;
  createUserId: string;
  createTime?: string;
  updateTime?: string;
  questionCount: number;
  questions?: Question[];
}
