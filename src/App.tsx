import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { MainLayout, ErrorBoundary } from '@/components';
import { readAuthToken } from '@/features/auth/storage';
import { HomePage } from '@/features/home';
import { LoginPage } from '@/features/auth';
import { LearningGoalsPage, LearningGoalDetailPage } from '@/features/learning-goals';
import { KnowledgePointsPage } from '@/features/knowledge-points';
import { LearningSessionPage } from '@/features/learning-session';
import { MaterialsPage } from '@/features/materials';
import { LearningStatsPage } from '@/features/learning-stats';
import { ExamPage } from '@/features/exam';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!readAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (readAuthToken()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#2563eb',
              colorInfo: '#2563eb',
              colorSuccess: '#2563eb',
              colorWarning: '#f59e0b',
              colorError: '#ef4444',
              colorBgLayout: '#f8fafc',
              colorBgContainer: '#ffffff',
              colorBorder: '#dbe3f0',
              colorTextBase: '#0f172a',
              borderRadius: 14,
              fontFamily: '"Aptos", "PingFang SC", "Microsoft YaHei UI", sans-serif',
            },
            components: {
              Card: {
                borderRadiusLG: 24,
              },
              Button: {
                borderRadius: 999,
              },
              Modal: {
                borderRadiusLG: 24,
              },
              Drawer: {
                borderRadiusLG: 24,
              },
            },
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

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
                <Route path="/learning-session/:goalId" element={<LearningSessionPage />} />
                <Route
                  path="/learning-session/:goalId/:pointId"
                  element={<LearningSessionPage />}
                />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/learning-stats" element={<LearningStatsPage />} />
                <Route path="/exam" element={<ExamPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
