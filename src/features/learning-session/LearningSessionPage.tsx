import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Drawer,
  Empty,
  List,
  Modal,
  Result,
  Segmented,
  Space,
  Spin,
  Tag,
} from 'antd';
import { ChatBox, MarkdownRenderer } from '@/components';
import {
  useCompleteSession,
  useCurrentSession,
  useHistorySessions,
  useKnowledgePoint,
  useKnowledgePoints,
  useLearningGoal,
  useLearningSession,
  useCreateLearningSession,
} from '@/hooks';
import { useLearningStore } from '@/stores';
import type {
  ChatMessage,
  KnowledgePoint,
  LearningSession,
  SessionCompleteResult,
  SessionMessage,
} from '@/types';
import { KnowledgePointStatus, LearningSessionStatus } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

const isLearningMode = (value: string): value is 'TEACHING' | 'COACH' =>
  value === 'TEACHING' || value === 'COACH';

const pointStatusConfig: Record<number, { color: string; text: string }> = {
  [KnowledgePointStatus.NOT_STARTED]: { color: 'default', text: '未开始' },
  [KnowledgePointStatus.LEARNING]: { color: 'processing', text: '学习中' },
  [KnowledgePointStatus.MASTERED]: { color: 'blue', text: '已掌握' },
};

const flattenPoints = (points: KnowledgePoint[]): KnowledgePoint[] =>
  points.reduce<KnowledgePoint[]>((acc, point) => {
    acc.push(point);
    if (point.children) {
      acc.push(...flattenPoints(point.children));
    }
    return acc;
  }, []);

const findDefaultPoint = (points: KnowledgePoint[]) => {
  const allPoints = flattenPoints(points);
  return (
    allPoints.find((point) => point.status === KnowledgePointStatus.LEARNING) ||
    allPoints.find((point) => point.status === KnowledgePointStatus.NOT_STARTED) ||
    allPoints[0] ||
    null
  );
};

const formatTime = (time: string | undefined) => {
  if (!time) return '';
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function LearningSessionPage() {
  const { goalId, pointId } = useParams<{ goalId: string; pointId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [resolvedPointId] = useState<string | null>(pointId || null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeResult, setCompleteResult] = useState<SessionCompleteResult | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [viewingSession, setViewingSession] = useState<LearningSession | null>(null);

  const lastSessionRequestRef = useRef<string | null>(null);
  const lastSyncedSessionIdRef = useRef<string | null>(null);
  const lastSyncedPointIdRef = useRef<string | null>(null);
  const isModeSwitching = useRef(false);

  const mode = useLearningStore((state) => state.mode);
  const setMode = useLearningStore((state) => state.setMode);
  const setCurrentSession = useLearningStore((state) => state.setCurrentSession);
  const setCurrentKnowledgePoint = useLearningStore((state) => state.setCurrentKnowledgePoint);
  const { mutate: createSession, isPending: isCreatingSession } = useCreateLearningSession();
  const completeSessionMutation = useCompleteSession();

  const { data: goal, isLoading: isGoalLoading } = useLearningGoal(goalId || '');
  const { data: knowledgeTree, isLoading: isKnowledgeTreeLoading } = useKnowledgePoints(
    goalId || ''
  );
  const activePointId = pointId || resolvedPointId || '';
  const { data: knowledgePoint, isLoading: isKnowledgePointLoading } =
    useKnowledgePoint(activePointId);
  const { data: currentSession, isLoading: isCurrentSessionLoading } =
    useCurrentSession(activePointId);
  const sessionId = currentSession?.id || '';
  const { data: historySessions } = useHistorySessions(activePointId);
  const { data: session } = useLearningSession(sessionId || '');

  useEffect(() => {
    if (pointId || resolvedPointId) return;
    if (!goalId || isKnowledgeTreeLoading) return;
    if (!Array.isArray(knowledgeTree) || knowledgeTree.length === 0) return;

    const defaultPoint = findDefaultPoint(knowledgeTree);
    if (!defaultPoint?.id) return;

    navigate(`/learning-session/${goalId}/${defaultPoint.id}`, { replace: true });
  }, [goalId, isKnowledgeTreeLoading, knowledgeTree, navigate, pointId, resolvedPointId]);

  useEffect(() => {
    if (!activePointId) return;
    if (isCurrentSessionLoading) return;

    if (isModeSwitching.current) {
      const requestKey = `${activePointId}:${mode}`;
      if (isCreatingSession || lastSessionRequestRef.current === requestKey) {
        return;
      }

      lastSessionRequestRef.current = requestKey;
      createSession(
        { pointId: activePointId, mode },
        {
          onSuccess: (newSession) => {
            isModeSwitching.current = false;
            lastSyncedSessionIdRef.current = newSession.id;
            setCurrentSession(newSession);
          },
          onError: () => {
            lastSessionRequestRef.current = null;
          },
        }
      );
      return;
    }

    if (currentSession) {
      lastSessionRequestRef.current = `${activePointId}:${currentSession.mode}`;

      if (lastSyncedSessionIdRef.current !== currentSession.id) {
        lastSyncedSessionIdRef.current = currentSession.id;
        setCurrentSession(currentSession);
      }

      if (isLearningMode(currentSession.mode) && currentSession.mode !== mode) {
        setMode(currentSession.mode);
      }

      return;
    }

    const requestKey = `${activePointId}:${mode}`;
    if (lastSessionRequestRef.current === requestKey || isCreatingSession) {
      return;
    }

    lastSessionRequestRef.current = requestKey;
    createSession(
      { pointId: activePointId, mode },
      {
        onSuccess: (newSession) => {
          lastSyncedSessionIdRef.current = newSession.id;
          setCurrentSession(newSession);
        },
        onError: () => {
          lastSessionRequestRef.current = null;
        },
      }
    );
  }, [
    activePointId,
    createSession,
    currentSession,
    isCreatingSession,
    isCurrentSessionLoading,
    mode,
    sessionId,
    setCurrentSession,
    setMode,
  ]);

  useEffect(() => {
    if (knowledgePoint && lastSyncedPointIdRef.current !== knowledgePoint.id) {
      lastSyncedPointIdRef.current = knowledgePoint.id;
      setCurrentKnowledgePoint(knowledgePoint);
    }
  }, [knowledgePoint, setCurrentKnowledgePoint]);

  const flatPoints = useMemo(
    () => (Array.isArray(knowledgeTree) ? flattenPoints(knowledgeTree) : []),
    [knowledgeTree]
  );

  const selectedPoint = knowledgePoint || flatPoints.find((point) => point.id === activePointId);
  const selectedPointStatus =
    selectedPoint?.status !== undefined ? pointStatusConfig[selectedPoint.status] : undefined;

  const handleBack = () => {
    navigate('/learning-goals');
  };

  const handleModeChange = (newMode: 'TEACHING' | 'COACH') => {
    if (newMode === mode) return;

    Modal.confirm({
      title: '切换学习模式',
      content: '切换后会为当前知识点开启一段新的会话，之前的记录会保留。继续吗？',
      onOk: () => {
        isModeSwitching.current = true;
        setMode(newMode);
        setCurrentSession(null);
        lastSessionRequestRef.current = null;
        lastSyncedSessionIdRef.current = null;
      },
    });
  };

  const handleComplete = () => {
    if (!sessionId) return;

    completeSessionMutation.mutate(sessionId, {
      onSuccess: (result) => {
        setCompleteResult(result);
        setShowCompleteModal(true);
      },
    });
  };

  const handleMessageSent = () => {
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ['learning-session', sessionId] });
    }
  };

  const isLoading =
    isGoalLoading ||
    isKnowledgeTreeLoading ||
    (Boolean(activePointId) &&
      (isKnowledgePointLoading || isCurrentSessionLoading || (isCreatingSession && !sessionId)));

  const renderSessionPreview = (sessionItem: LearningSession) => (
    <div className="space-y-4">
      <Button type="text" onClick={() => setViewingSession(null)} className="px-0">
        返回历史列表
      </Button>
      <div className="rounded-3xl border border-stone-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Tag color={sessionItem.mode === 'TEACHING' ? 'blue' : 'gold'}>
            {sessionItem.mode === 'TEACHING' ? '教学模式' : '引导模式'}
          </Tag>
          <Tag
            color={sessionItem.status === LearningSessionStatus.IN_PROGRESS ? 'processing' : 'blue'}
          >
            {sessionItem.status === LearningSessionStatus.IN_PROGRESS ? '进行中' : '已完成'}
          </Tag>
        </div>
        <div className="mt-3 text-sm text-slate-500">
          创建时间：{formatTime(sessionItem.createTime)}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          掌握分数：
          {sessionItem.masteryScore !== null && sessionItem.masteryScore !== undefined
            ? `${sessionItem.masteryScore}%`
            : '-'}
        </div>
      </div>

      <div className="max-h-[52vh] overflow-y-auto space-y-3 rounded-3xl border border-stone-200 bg-white p-4">
        {sessionItem.messages && sessionItem.messages.length > 0 ? (
          sessionItem.messages.map((msg, index) => {
            const isUser = msg.role === 'USER' || msg.role?.toUpperCase() === 'USER';
            return (
              <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <Avatar
                  icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                  style={{ backgroundColor: isUser ? '#2563eb' : '#0f172a' }}
                />
                <div
                  className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                    isUser ? 'bg-[#2563eb] text-white' : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Empty description="暂无历史对话" />
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" tip="正在整理你的学习空间..." />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      <ChatBox
        className="h-full w-full"
        sessionId={sessionId || ''}
        initialMessages={
          Array.isArray(session?.messages)
            ? (session.messages.map((msg: SessionMessage, index: number) => ({
                id: `${sessionId || 'session'}-${index}`,
                sessionId: sessionId || '',
                role: msg.role,
                content: msg.content,
                createdAt: msg.createTime || new Date().toISOString(),
              })) as ChatMessage[])
            : []
        }
        onMessageSent={handleMessageSent}
        title="学习对话"
        subtitle="把顶层信息收起来，只把当前知识点和对话留在前面。"
        placeholder="直接问我这个知识点，或者让我带你做练习。"
        emptyTitle="当前还没有可聊的知识点"
        emptyDescription="先点击顶部返回按钮回到学习空间，选中一个知识点后就能直接开始聊天。"
        emptyAction={
          <Space wrap>
            <Button onClick={() => navigate('/knowledge-points/' + (goalId || ''))}>
              去整理知识点
            </Button>
            <Button type="primary" onClick={() => navigate('/learning-goals')}>
              返回学习空间
            </Button>
          </Space>
        }
        header={
          <div className="space-y-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={handleBack}
                className="h-10 rounded-2xl border border-stone-200 bg-white/90 px-4 text-slate-700 shadow-sm"
              >
                返回
              </Button>

              <div className="flex justify-center">
                <Segmented
                  value={mode}
                  options={[
                    { label: '教学模式', value: 'TEACHING', icon: <BookOutlined /> },
                    { label: '引导模式', value: 'COACH', icon: <BulbOutlined /> },
                  ]}
                  onChange={(value) => handleModeChange(value as 'TEACHING' | 'COACH')}
                />
              </div>

              <div className="flex justify-end">
                <Space wrap>
                  <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    onClick={() => setShowHistoryDrawer(true)}
                    disabled={!activePointId}
                  >
                    历史
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleComplete}
                    loading={completeSessionMutation.isPending}
                    disabled={!sessionId}
                  >
                    完成学习
                  </Button>
                </Space>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Learning Space
              </div>
              <span>·</span>
              <div className="truncate text-sm font-semibold text-slate-900">
                {goal?.title || '学习空间'} · {selectedPoint?.title || '请选择知识点'}
              </div>
              <Tag color={selectedPointStatus?.color || 'default'} className="mr-0">
                {selectedPointStatus?.text || '待选择'}
              </Tag>
            </div>
          </div>
        }
      />

      <Drawer
        title="历史记录"
        open={showHistoryDrawer}
        onClose={() => {
          setShowHistoryDrawer(false);
          setViewingSession(null);
        }}
        width={440}
        placement="right"
      >
        {viewingSession ? (
          renderSessionPreview(viewingSession)
        ) : historySessions && historySessions.length > 0 ? (
          <List
            dataSource={historySessions}
            renderItem={(item: LearningSession) => (
              <List.Item>
                <button
                  type="button"
                  onClick={() => setViewingSession(item)}
                  className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Tag color={item.mode === 'TEACHING' ? 'blue' : 'gold'}>
                        {item.mode === 'TEACHING' ? '教学' : '引导'}
                      </Tag>
                      <Tag color={item.status === 0 ? 'processing' : 'blue'}>
                        {item.status === 0 ? '进行中' : '已完成'}
                      </Tag>
                    </div>
                    <span className="text-xs text-slate-400">{formatTime(item.createTime)}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {item.pointTitle || '未命名知识点'}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.masteryScore !== null && item.masteryScore !== undefined
                      ? `掌握分数 ${item.masteryScore}%`
                      : '暂无掌握分数'}
                  </div>
                </button>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无历史记录" />
        )}
      </Drawer>

      <Modal
        open={showCompleteModal}
        title="学习完成"
        onCancel={() => {
          setShowCompleteModal(false);
          navigate('/learning-goals');
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowCompleteModal(false);
              navigate('/learning-goals');
            }}
          >
            返回
          </Button>,
        ]}
        width={640}
      >
        {completeResult && (
          <div className="space-y-4">
            <Result
              icon={<CheckCircleOutlined style={{ color: '#2563eb' }} />}
              title={`本次学习评分：${completeResult.evaluation.masteryScore} 分`}
              subTitle={completeResult.evaluation.encouragement}
            />

            {completeResult.evaluation.strengths.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">表现不错</div>
                <List
                  size="small"
                  dataSource={completeResult.evaluation.strengths}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="blue">优点</Tag>
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            )}

            {completeResult.evaluation.gapsFound.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">待加强</div>
                <List
                  size="small"
                  dataSource={completeResult.evaluation.gapsFound}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="orange">缺口</Tag>
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            )}

            {completeResult.evaluation.suggestedReview.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">建议复习</div>
                <List
                  size="small"
                  dataSource={completeResult.evaluation.suggestedReview}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
