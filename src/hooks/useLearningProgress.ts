import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api';

// ==================== 学习目标相关 Hooks ====================

export function useLearningGoals(page = 1, size = 10) {
  return useQuery({
    queryKey: ['learning-goals', page, size],
    queryFn: () => api.getLearningGoals({ pageNum: page, pageSize: size }),
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

// ==================== 知识点相关 Hooks ====================

export function useKnowledgePoints(goalId: string) {
  return useQuery({
    queryKey: ['knowledge-points', goalId],
    queryFn: () => api.getKnowledgePoints(goalId),
    enabled: !!goalId,
  });
}

// 兼容旧的命名
export const useKnowledgeTree = useKnowledgePoints;

export function useKnowledgePoint(id: string) {
  return useQuery({
    queryKey: ['knowledge-point', id],
    queryFn: () => api.getKnowledgePoint(id),
    enabled: !!id,
  });
}

export function useCreateKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createKnowledgePoint,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points', data.goalId] });
    },
  });
}

export function useUpdateKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof api.updateKnowledgePoint>[1];
    }) => api.updateKnowledgePoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points'] });
    },
  });
}

export function useDeleteKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteKnowledgePoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points'] });
    },
  });
}

export function useUpdateSortOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, pointIds }: { goalId: string; pointIds: string[] }) =>
      api.updateSortOrder(goalId, pointIds),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points', goalId] });
    },
  });
}

export function useUpdateMasteryLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, masteryLevel }: { id: string; masteryLevel: number }) =>
      api.updateMasteryLevel(id, masteryLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points'] });
    },
  });
}

// AI 知识点生成
export function useGenerateKnowledgePoints() {
  return useMutation({
    mutationFn: api.generateKnowledgePoints,
  });
}

export function useConfirmKnowledgePoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, points }: { goalId: string; points: api.GeneratedKnowledgePoint[] }) =>
      api.confirmKnowledgePoints(goalId, points),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points', goalId] });
    },
  });
}

export function useRegenerateKnowledgePoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.regenerateKnowledgePoints,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-points', data.goalId] });
    },
  });
}

// 兼容旧的命名（已废弃）
export const useDecomposeKnowledgePoint = useRegenerateKnowledgePoints;

// ==================== 学习会话相关 Hooks ====================

export function useLearningSession(id: string) {
  return useQuery({
    queryKey: ['learning-session', id],
    queryFn: () => api.getLearningSession(id),
    enabled: !!id,
  });
}

export function useCurrentSession(pointId: string) {
  return useQuery({
    queryKey: ['current-session', pointId],
    queryFn: () => api.getCurrentSession(pointId),
    enabled: !!pointId,
  });
}

// 获取会话消息（从会话详情中获取）
export function useSessionMessages(sessionId: string) {
  const { data: session } = useLearningSession(sessionId);
  return {
    data: session?.messages,
    isLoading: !session,
    error: null,
  };
}

export function useCreateLearningSession() {
  return useMutation({
    mutationFn: api.createLearningSession,
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.completeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-session'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-points'] });
    },
  });
}

export function useSetSearchScope() {
  return useMutation({
    mutationFn: ({ sessionId, scope }: { sessionId: string; scope: 'POINT' | 'GOAL' | 'ALL' }) =>
      api.setSearchScope(sessionId, scope),
  });
}

// ==================== 学习资料相关 Hooks ====================

export function useMaterials(params: {
  goalId: string;
  pointId?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => api.getMaterials(params),
    enabled: !!params.goalId,
  });
}

export function useMaterialDetail(id: string) {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => api.getMaterialDetail(id),
    enabled: !!id,
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.uploadMaterial,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ['materials'],
        predicate: (query) => {
          const params = query.queryKey[1] as { goalId?: string };
          return params?.goalId === data.goalId;
        },
      });
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

export function useBatchDeleteMaterials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.batchDeleteMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useUpdateMaterialPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pointIds }: { id: string; pointIds: string[] }) =>
      api.updateMaterialPoints(id, pointIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useMaterialStats(goalId: string) {
  return useQuery({
    queryKey: ['material-stats', goalId],
    queryFn: () => api.getMaterialStats(goalId),
    enabled: !!goalId,
  });
}

// AI 搜索
export function useSearchMaterials() {
  return useMutation({
    mutationFn: api.searchMaterials,
  });
}

export function useSaveSearchResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.saveSearchResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

// 兼容旧的 createMaterial（已废弃，使用 uploadMaterial 或 saveSearchResult）
export function useCreateMaterial() {
  return useUploadMaterial();
}

// ==================== 学习统计相关 Hooks ====================

export function useLearningStatsOverview() {
  return useQuery({
    queryKey: ['learning-stats-overview'],
    queryFn: api.getLearningStatsOverview,
  });
}

export function useProgressCurve(params?: { goalId?: string; days?: number }) {
  return useQuery({
    queryKey: ['progress-curve', params],
    queryFn: () => api.getProgressCurve(params),
  });
}

// ==================== 试卷相关 Hooks ====================

export function useExams(params?: { examTitle?: string; status?: number; createUserId?: string }) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => api.getExams(params),
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

// 删除试卷功能暂未实现
// export function useDeleteExam() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: api.deleteExam,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['exams'] });
//     },
//   });
// }
