import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  RobotOutlined,
  UserOutlined,
  BookOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  List,
  Modal,
  Progress,
  Result,
  Segmented,
  Space,
  Spin,
  Tag,
} from 'antd';
import { ChatBox, KnowledgeTree, MarkdownRenderer } from '@/components';
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
import type { ChatMessage, LearningSession, SessionCompleteResult, SessionMessage } from '@/types';
import { KnowledgePointStatus, LearningSessionStatus } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

const isLearningMode = (value: string): value is 'TEACHING' | 'COACH' =>
  value === 'TEACHING' || value === 'COACH';

export function LearningSessionPage() {
  const { goalId, pointId } = useParams<{ goalId: string; pointId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeResult, setCompleteResult] = useState<SessionCompleteResult | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingSession, setViewingSession] = useState<LearningSession | null>(null);

  const hasInitialized = useRef(false);
  const isModeSwitching = useRef(false);

  const { mode, setMode, setCurrentSession, setCurrentKnowledgePoint } = useLearningStore();
  const createSessionMutation = useCreateLearningSession();
  const completeSessionMutation = useCompleteSession();

  const { data: goal } = useLearningGoal(goalId || '');
  const { data: knowledgePoint, isLoading: isKnowledgePointLoading } = useKnowledgePoint(
    pointId || ''
  );
  const { data: knowledgeTree, isLoading: isKnowledgeTreeLoading } = useKnowledgePoints(
    goalId || ''
  );
  const { data: currentSession, isLoading: isCurrentSessionLoading } = useCurrentSession(
    pointId || ''
  );
  const { data: historySessions } = useHistorySessions(pointId || '');
  const { data: session } = useLearningSession(sessionId || '');

  const messages: ChatMessage[] = useMemo(() => {
    const sessionMessages = session?.messages;
    if (!sessionMessages || !Array.isArray(sessionMessages)) return [];

    return sessionMessages.map((msg: SessionMessage, index: number) => ({
      id: `${sessionId || 'session'}-${index}`,
      sessionId: sessionId || '',
      role: msg.role,
      content: msg.content,
      createdAt: msg.createTime || new Date().toISOString(),
    }));
  }, [session?.messages, sessionId]);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!pointId) return;
    if (isCurrentSessionLoading) return;

    if (isModeSwitching.current) {
      isModeSwitching.current = false;
      hasInitialized.current = true;
      createSessionMutation.mutate(
        { pointId, mode },
        {
          onSuccess: (newSession) => {
            setSessionId(newSession.id);
            setCurrentSession(newSession);
          },
        }
      );
      return;
    }

    if (currentSession) {
      hasInitialized.current = true;
      setSessionId(currentSession.id);
      setCurrentSession(currentSession);
      if (isLearningMode(currentSession.mode)) {
        setMode(currentSession.mode);
      }
      return;
    }

    if (!createSessionMutation.isPending) {
      hasInitialized.current = true;
      createSessionMutation.mutate(
        { pointId, mode },
        {
          onSuccess: (newSession) => {
            setSessionId(newSession.id);
            setCurrentSession(newSession);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointId, currentSession, isCurrentSessionLoading, mode]);

  useEffect(() => {
    if (knowledgePoint) {
      setCurrentKnowledgePoint(knowledgePoint);
    }
  }, [knowledgePoint, setCurrentKnowledgePoint]);

  const handleBack = () => {
    navigate(`/knowledge-points/${goalId}`);
  };

  const handleViewHistory = (item: LearningSession) => {
    setViewingSession(item);
    setShowHistoryModal(true);
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

  const handleModeChange = (newMode: 'TEACHING' | 'COACH') => {
    if (newMode === mode) return;

    Modal.confirm({
      title: '切换学习模式',
      content: '切换后会重新创建一个新的学习会话，当前会话会保留。确定继续吗？',
      onOk: () => {
        isModeSwitching.current = true;
        setMode(newMode);
        setSessionId(null);
        setCurrentSession(null);
        hasInitialized.current = false;
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

  const handleCompleteModalClose = () => {
    setShowCompleteModal(false);
    navigate(`/knowledge-points/${goalId}`);
  };

  const handleMessageSent = () => {
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ['learning-session', sessionId] });
    }
  };

  const isLoading =
    isKnowledgePointLoading ||
    isKnowledgeTreeLoading ||
    isCurrentSessionLoading ||
    createSessionMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="正在准备学习空间..." />
      </div>
    );
  }

  const pointStatusText =
    knowledgePoint?.status === KnowledgePointStatus.MASTERED
      ? '已掌握'
      : knowledgePoint?.status === KnowledgePointStatus.LEARNING
        ? '学习中'
        : '未开始';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="px-0">
            返回学习空间
          </Button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-600">
              AI Learning Room
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {goal?.title || '学习空间'} · {knowledgePoint?.title || '当前知识点'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              在这里你可以像使用 ChatGPT 一样，围绕一个知识点持续追问、讲解和练习。
            </p>
          </div>
        </div>

        <Space wrap>
          <Segmented
            value={mode}
            options={[
              { label: '教学模式', value: 'TEACHING', icon: <BookOutlined /> },
              { label: '引导模式', value: 'COACH', icon: <BulbOutlined /> },
            ]}
            onChange={(value) => handleModeChange(value as 'TEACHING' | 'COACH')}
          />
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

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <Card title="学习空间概览">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {goal?.title || '未命名空间'}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-500">
                  {goal?.description || '暂无描述'}
                </div>
              </div>
              <Progress percent={goal?.progress || 0} />
              <Space wrap>
                <Tag color="processing" className="rounded-full border-0 px-3">
                  {knowledgeTree?.length || 0} 个知识点
                </Tag>
                <Tag color="green" className="rounded-full border-0 px-3">
                  {mode === 'TEACHING' ? '教学模式' : '引导模式'}
                </Tag>
              </Space>
            </div>
          </Card>

          <Card title="知识点树">
            <KnowledgeTree
              data={Array.isArray(knowledgeTree) ? knowledgeTree : []}
              onSelect={(point) => {
                if (goalId && point.id) {
                  navigate(`/learning-session/${goalId}/${point.id}`);
                }
              }}
            />
          </Card>
        </aside>

        <main className="min-w-0">
          <ChatBox
            sessionId={sessionId || ''}
            initialMessages={messages}
            onMessageSent={handleMessageSent}
            title={knowledgePoint?.title || goal?.title || '学习对话'}
            subtitle={
              mode === 'TEACHING'
                ? '教学模式：你来提问，我来讲解'
                : '引导模式：AI 先问你，再帮你补齐'
            }
            placeholder="直接说你想学什么，或者让 AI 带你把当前知识点讲透"
          />
        </main>

        <aside className="space-y-4">
          {knowledgePoint && (
            <Card title="当前知识点">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="名称">{knowledgePoint.title}</Descriptions.Item>
                <Descriptions.Item label="状态">{pointStatusText}</Descriptions.Item>
                <Descriptions.Item label="掌握程度">
                  {knowledgePoint.masteryLevel}%
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {session && (
            <Card title="会话信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="状态">
                  <Tag
                    color={
                      session.status === LearningSessionStatus.IN_PROGRESS
                        ? 'processing'
                        : 'success'
                    }
                  >
                    {session.status === LearningSessionStatus.IN_PROGRESS ? '进行中' : '已完成'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatTime(session.createTime)}
                </Descriptions.Item>
                <Descriptions.Item label="掌握分数">
                  {session.masteryScore !== null && session.masteryScore !== undefined
                    ? `${session.masteryScore}%`
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {historySessions && historySessions.length > 0 && (
            <Card
              title={
                <span>
                  <HistoryOutlined className="mr-1" />
                  历史记录
                </span>
              }
            >
              <List
                size="small"
                dataSource={historySessions}
                renderItem={(item: LearningSession) => (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        size="small"
                        onClick={() => handleViewHistory(item)}
                      >
                        查看
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={4}>
                          <Tag color={item.mode === 'TEACHING' ? 'blue' : 'green'}>
                            {item.mode === 'TEACHING' ? '教学' : '引导'}
                          </Tag>
                          <Tag color={item.status === 0 ? 'processing' : 'success'}>
                            {item.status === 0 ? '进行中' : '已完成'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div className="text-xs">
                          {item.masteryScore !== null && item.masteryScore !== undefined && (
                            <div>掌握程度：{item.masteryScore}%</div>
                          )}
                          <div>{formatTime(item.createTime)}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </aside>
      </div>

      <Modal
        open={showCompleteModal}
        title="学习完成"
        onCancel={handleCompleteModalClose}
        footer={[
          <Button key="close" onClick={handleCompleteModalClose}>
            返回
          </Button>,
        ]}
        width={640}
      >
        {completeResult && (
          <div className="space-y-4">
            <Result
              icon={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
              title={`本次学习评分：${completeResult.evaluation.masteryScore} 分`}
              subTitle={completeResult.evaluation.encouragement}
            />

            {completeResult.evaluation.strengths.length > 0 && (
              <Card size="small" title="表现良好">
                <List
                  size="small"
                  dataSource={completeResult.evaluation.strengths}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="green">优点</Tag>
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {completeResult.evaluation.gapsFound.length > 0 && (
              <Card size="small" title="待加强">
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
              </Card>
            )}

            {completeResult.evaluation.suggestedReview.length > 0 && (
              <Card size="small" title="建议复习">
                <List
                  size="small"
                  dataSource={completeResult.evaluation.suggestedReview}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="历史学习记录"
        open={showHistoryModal}
        onCancel={() => {
          setShowHistoryModal(false);
          setViewingSession(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowHistoryModal(false);
              setViewingSession(null);
            }}
          >
            关闭
          </Button>,
        ]}
        width={760}
      >
        {viewingSession && (
          <div>
            <Descriptions column={2} size="small" className="mb-4">
              <Descriptions.Item label="学习模式">
                <Tag color={viewingSession.mode === 'TEACHING' ? 'blue' : 'green'}>
                  {viewingSession.mode === 'TEACHING' ? '教学模式' : '引导模式'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="掌握程度">
                {viewingSession.masteryScore !== null && viewingSession.masteryScore !== undefined
                  ? `${viewingSession.masteryScore}%`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={viewingSession.status === 0 ? 'processing' : 'success'}>
                  {viewingSession.status === 0 ? '进行中' : '已完成'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatTime(viewingSession.createTime)}
              </Descriptions.Item>
            </Descriptions>

            <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 p-4">
              {viewingSession.messages && viewingSession.messages.length > 0 ? (
                viewingSession.messages.map((msg, index) => {
                  const isUser = msg.role === 'USER' || msg.role?.toUpperCase() === 'USER';
                  return (
                    <div
                      key={index}
                      className={`mb-4 flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar
                        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                        style={{ backgroundColor: isUser ? '#0f766e' : '#0f172a' }}
                      />
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                          isUser ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'
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
                <Empty description="暂无对话记录" />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
