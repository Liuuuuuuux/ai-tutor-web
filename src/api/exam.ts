import request from './client';

// 试卷类型定义
export interface ExamPaper {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  questions: ExamQuestion[];
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
  score: number;
}

export interface GenerateExamRequest {
  goalId: string;
  title?: string;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionTypes: string[];
}

export interface ExamListResponse {
  records: ExamPaper[];
  total: number;
  size: number;
  current: number;
}

// 生成试卷
export function generateExam(data: GenerateExamRequest): Promise<ExamPaper> {
  return request.post('/exams/generate', data);
}

// 获取试卷列表
export function getExams(goalId?: string): Promise<ExamListResponse> {
  return request.get('/exams', { params: { goalId } });
}

// 获取试卷详情
export function getExamDetail(id: string): Promise<ExamPaper> {
  return request.get(`/exams/${id}`);
}

// 删除试卷
export function deleteExam(id: string): Promise<void> {
  return request.delete(`/exams/${id}`);
}
