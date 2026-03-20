// 用户相关类型
export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 学习目标
export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// 创建学习目标请求
export interface CreateLearningGoalRequest {
  title: string;
  description: string;
}

// 知识点
export interface KnowledgePoint {
  id: string;
  goalId: string;
  parentId?: string;
  title: string;
  description: string;
  level: number;
  order: number;
  status: 'NOT_STARTED' | 'LEARNING' | 'MASTERED';
  masteryScore?: number;
  createdAt: string;
  updatedAt: string;
  children?: KnowledgePoint[];
}

// 学习会话
export interface LearningSession {
  id: string;
  goalId: string;
  knowledgePointId: string;
  mode: 'TEACHING' | 'COACH';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  progress: number;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}

// SSE 流式消息
export interface SSEMessage {
  type: 'content' | 'done' | 'error';
  content?: string;
  message?: string;
}

// 学习资料
export interface Material {
  id: string;
  goalId: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'TEXT';
  url: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

// 创建资料请求
export interface CreateMaterialRequest {
  goalId: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'TEXT';
  url: string;
}
