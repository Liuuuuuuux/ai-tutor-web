import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api';

// 学习目标相关 Hooks
export function useLearningGoals(page = 1, size = 10) {
  return useQuery({
    queryKey: ['learning-goals', page, size],
    queryFn: () => api.getLearningGoals({ current: page, size }),
  });
}

export function useLearningGoal(id: string) {
  return useQuery({
    queryKey: ['learning-goal', id],
    queryFn: () => api.getLearningGoal(id),
    enabled: !!id,
  });
}

export function useCreateLearningGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLearningGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
    },
  });
}

export function useUpdateLearningGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof api.updateLearningGoal>[1];
    }) => api.updateLearningGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
    },
  });
}

export function useDeleteLearningGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteLearningGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
    },
  });
}

// 知识点相关 Hooks
export function useKnowledgeTree(goalId: string) {
  return useQuery({
    queryKey: ['knowledge-tree', goalId],
    queryFn: () => api.getKnowledgeTree(goalId),
    enabled: !!goalId,
  });
}

export function useDecomposeKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.decomposeKnowledgePoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-tree'] });
    },
  });
}

// 学习会话相关 Hooks
export function useLearningSession(id: string) {
  return useQuery({
    queryKey: ['learning-session', id],
    queryFn: () => api.getLearningSession(id),
    enabled: !!id,
  });
}

export function useSessionMessages(sessionId: string) {
  return useQuery({
    queryKey: ['session-messages', sessionId],
    queryFn: () => api.getSessionMessages(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateLearningSession() {
  return useMutation({
    mutationFn: api.createLearningSession,
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      api.sendMessage(sessionId, content),
  });
}

// 学习资料相关 Hooks
export function useMaterials(goalId: string, page = 1, size = 10) {
  return useQuery({
    queryKey: ['materials', goalId, page, size],
    queryFn: () => api.getMaterials(goalId, { current: page, size }),
    enabled: !!goalId,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMaterial,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['materials', data.goalId] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

// 试卷相关 Hooks
export function useExams(goalId?: string) {
  return useQuery({
    queryKey: ['exams', goalId],
    queryFn: () => api.getExams(goalId),
  });
}

export function useExamDetail(id: string) {
  return useQuery({
    queryKey: ['exam-detail', id],
    queryFn: () => api.getExamDetail(id),
    enabled: !!id,
  });
}

export function useGenerateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.generateExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
