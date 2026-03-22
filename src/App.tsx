import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { MainLayout } from '@/components';
import { HomePage } from '@/features/home';
import { LoginPage } from '@/features/auth';
import { LearningGoalsPage, LearningGoalDetailPage } from '@/features/learning-goals';
import { KnowledgePointsPage } from '@/features/knowledge-points';
import { LearningSessionPage } from '@/features/learning-session';
import { MaterialsPage } from '@/features/materials';
import { LearningStatsPage } from '@/features/learning-stats';
import { ExamPage } from '@/features/exam';

// 创建 Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 分钟
    },
  },
});

// 路由守卫组件
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// 登录路由守卫
function PublicRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId');
  if (userId) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* 登录页 - 无 Layout */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* 主应用 - 带 Layout */}
            <Route
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/learning-goals" element={<LearningGoalsPage />} />
              <Route path="/learning-goals/:id" element={<LearningGoalDetailPage />} />
              <Route path="/knowledge-points/:goalId" element={<KnowledgePointsPage />} />
              <Route path="/learning-session/:goalId/:pointId" element={<LearningSessionPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/learning-stats" element={<LearningStatsPage />} />
              <Route path="/exam" element={<ExamPage />} />
            </Route>

            {/* 兜底路由 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
