import request from './client';
import type { ExamPaper } from '@/types';

// 试卷生成请求 - 匹配后端 ExamGenerationPromptDTO
export interface GenerateExamRequest {
  sourceText?: string;
  filePath?: string;
  examConfig: {
    examTitle: string;
    requiredTypes: string[];
    config: {
      [key: string]: {
        difficulty: string;
        count: number;
      };
    };
  };
}

// 状态映射
export const examStatusMap: Record<number, { key: string; text: string; color: string }> = {
  0: { key: 'DRAFT', text: '草稿', color: 'default' },
  1: { key: 'PUBLISHED', text: '已发布', color: 'blue' },
  2: { key: 'CLOSED', text: '已关闭', color: 'error' },
};

// 生成试卷
export function generateExam(data: GenerateExamRequest): Promise<ExamPaper> {
  return request.post('/aiExamGeneration', data);
}

// 获取试卷列表 - 后端返回数组
export function getExams(params?: {
  examTitle?: string;
  status?: number;
  createUserId?: string;
}): Promise<ExamPaper[]> {
  return request.get('/exam-paper/list', { params });
}

// 获取试卷详情
export function getExamDetail(id: string): Promise<ExamPaper> {
  return request.get(`/exam-paper/${id}`);
}

// 根据标题搜索试卷
export function searchExamsByTitle(title: string): Promise<ExamPaper[]> {
  return request.get('/exam-paper/search', { params: { title } });
}

// 根据状态查询试卷
export function getExamsByStatus(status: number): Promise<ExamPaper[]> {
  return request.get(`/exam-paper/status/${status}`);
}

// 查询用户创建的试卷
export function getExamsByUser(userId: string): Promise<ExamPaper[]> {
  return request.get(`/exam-paper/user/${userId}`);
}

// 查询所有试卷
export function getAllExams(): Promise<ExamPaper[]> {
  return request.get('/exam-paper/all');
}
