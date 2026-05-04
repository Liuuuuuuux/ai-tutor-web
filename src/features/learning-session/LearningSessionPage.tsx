import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Radio,
  Button,
  Spin,
  Empty,
  Descriptions,
  Modal,
  Result,
  List,
  Tag,
  Avatar,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ChatBox, MarkdownRenderer } from '@/components';
import {
  useLearningSession,
  useCreateLearningSession,
  useCompleteSession,
  useCurrentSession,
  useKnowledgePoint,
  useHistorySessions,
} from '@/hooks';
import { useLearningStore } from '@/stores';
import { useQueryClient } from '@tanstack/react-query';
import type { SessionCompleteResult, ChatMessage, SessionMessage, LearningSession } from '@/types';
import { KnowledgePointStatus, LearningSessionStatus } from '@/types';

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

  // 使用 ref 追踪是否已初始化，避免触发重新渲染
  const hasInitialized = useRef(false);
  // 标记用户是否主动切换模式（切换后需要跳过恢复旧会话）
  const isModeSwitching = useRef(false);

  const { mode, setMode, setCurrentSession, setCurrentKnowledgePoint } = useLearningStore();
  const createSessionMutation = useCreateLearningSession();
  const completeSessionMutation = useCompleteSession();

  // 获取知识点详情
  const { data: knowledgePoint, isLoading: isKnowledgePointLoading } = useKnowledgePoint(
    pointId || ''
  );

  // 检查是否有进行中的会话
  const { data: currentSession, isLoading: isCurrentSessionLoading } = useCurrentSession(
    pointId || ''
  );

  // 获取历史会话列表
  const { data: historySessions } = useHistorySessions(pointId || '');

  // 获取会话详情
  const { data: session } = useLearningSession(sessionId || '');

  // 从会话详情中获取消息，并转换为 ChatMessage 格式
  // 使用 session.messages 作为依赖（React Compiler 要求）
  const sessionMessages = session?.messages;
  const currentSessionId = sessionId || '';
  const messages: ChatMessage[] = useMemo(() => {
    if (!sessionMessages || !Array.isArray(sessionMessages)) return [];
    return sessionMessages.map((msg: SessionMessage, index: number) => ({
      id: `${currentSessionId}-${index}`,
      sessionId: currentSessionId,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createTime || new Date().toISOString(),
    }));
  }, [sessionMessages, currentSessionId]);

  // 初始化：检查是否有进行中的会话，或创建新会话
  useEffect(() => {
    // 只在组件挂载时执行一次
    if (hasInitialized.current) return;
    if (!pointId) return;
    // 等待当前会话查询完成后再决定是否创建新会话
    if (isCurrentSessionLoading) return;

    // 如果用户主动切换模式，跳过恢复旧会话，直接创建新会话
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
      // 有进行中的会话，恢复它
      hasInitialized.current = true;
      setSessionId(currentSession.id);
      setCurrentSession(currentSession);
      // 同步会话模式到 store
      if (isLearningMode(currentSession.mode)) {
        setMode(currentSession.mode);
      }
    } else if (!createSessionMutation.isPending) {
      // 没有进行中的会话，创建新的
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

  // 更新知识点信息
  useEffect(() => {
    if (knowledgePoint) {
      setCurrentKnowledgePoint(knowledgePoint);
    }
  }, [knowledgePoint, setCurrentKnowledgePoint]);

  const handleBack = () => {
    navigate(`/knowledge-points/${goalId}`);
  };

  const handleViewHistory = (session: LearningSession) => {
    setViewingSession(session);
    setShowHistoryModal(true);
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleModeChange = (newMode: 'TEACHING' | 'COACH') => {
    if (newMode === mode) return;
    // 切换模式需要确认
    Modal.confirm({
      title: '切换学习模式',
      content: '切换模式将开始新的学习会话，当前会话将被保留。确定要切换吗？',
      onOk: () => {
        // 标记用户主动切换模式，跳过恢复旧会话
        isModeSwitching.current = true;

        // 更新模式并重置状态
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

  // 处理消息发送后刷新会话数据
  const handleMessageSent = () => {
    if (sessionId) {
      // 重新获取会话详情，同步后端保存的消息
      queryClient.invalidateQueries({ queryKey: ['learning-session', sessionId] });
    }
  };

  if (isKnowledgePointLoading || isCurrentSessionLoading || createSessionMutation.isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin
          size="large"
          tip={
            isKnowledgePointLoading
              ? '正在加载知识点...'
              : isCurrentSessionLoading
                ? '正在检查会话状态...'
                : '正在创建学习会话...'
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回知识点
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleComplete}
          loading={completeSessionMutation.isPending}
          disabled={!sessionId}
        >
          结束学习
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧信息栏 */}
        <div className="lg:col-span-1">
          <Card title="学习模式" className="mb-4">
            <Radio.Group
              value={mode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="w-full"
            >
              <Radio.Button value="TEACHING" className="w-1/2 text-center">
                <BookOutlined className="mr-1" />
                教学模式
              </Radio.Button>
              <Radio.Button value="COACH" className="w-1/2 text-center">
                <BulbOutlined className="mr-1" />
                引导模式
              </Radio.Button>
            </Radio.Group>
            <p className="text-xs text-gray-500 mt-2">
              {mode === 'TEACHING' ? '你来讲，AI 来学' : 'AI 引导你学习'}
            </p>
          </Card>

          {knowledgePoint && (
            <Card title="知识点" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="标题">{knowledgePoint.title}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag
                    color={
                      knowledgePoint.status === KnowledgePointStatus.MASTERED
                        ? 'success'
                        : knowledgePoint.status === KnowledgePointStatus.LEARNING
                          ? 'processing'
                          : 'default'
                    }
                  >
                    {knowledgePoint.status === KnowledgePointStatus.MASTERED
                      ? '已掌握'
                      : knowledgePoint.status === KnowledgePointStatus.LEARNING
                        ? '学习中'
                        : '未开始'}
                  </Tag>
                </Descriptions.Item>
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
              </Descriptions>
            </Card>
          )}

          {/* 历史记录 */}
          {historySessions && historySessions.length > 0 && (
            <Card
              title={
                <span>
                  <HistoryOutlined className="mr-1" />
                  历史记录
                </span>
              }
              className="mt-4"
            >
              <List
                size="small"
                dataSource={historySessions}
                renderItem={(session: LearningSession) => (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        size="small"
                        onClick={() => handleViewHistory(session)}
                      >
                        查看
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={4}>
                          <Tag color={session.mode === 'TEACHING' ? 'blue' : 'green'}>
                            {session.mode === 'TEACHING' ? '教学' : '引导'}
                          </Tag>
                          <Tag color={session.status === 0 ? 'processing' : 'success'}>
                            {session.status === 0 ? '进行中' : '已完成'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div className="text-xs">
                          {session.masteryScore !== null && session.masteryScore !== undefined && (
                            <div>掌握程度：{session.masteryScore}%</div>
                          )}
                          <div>{formatTime(session.createTime)}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>

        {/* 右侧聊天区域 */}
        <div className="lg:col-span-3">
          {sessionId ? (
            <ChatBox
              sessionId={sessionId}
              initialMessages={messages || []}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <Empty description="正在加载会话..." className="py-20" />
          )}
        </div>
      </div>

      {/* 学习完成弹窗 */}
      <Modal
        open={showCompleteModal}
        title="学习完成"
        onCancel={handleCompleteModalClose}
        footer={[
          <Button key="close" onClick={handleCompleteModalClose}>
            返回
          </Button>,
        ]}
        width={600}
      >
        {completeResult && (
          <div className="space-y-4">
            <Result
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title={`本次学习评分：${completeResult.evaluation.masteryScore}分`}
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
                      <Tag color="orange">漏洞</Tag>
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

      {/* 历史对话查看 Modal */}
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
        width={700}
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

            {/* 对话内容 */}
            <div
              style={{ maxHeight: '400px', overflowY: 'auto' }}
              className="border rounded-lg p-4"
            >
              {viewingSession.messages && viewingSession.messages.length > 0 ? (
                viewingSession.messages.map((msg, index) => {
                  const isUser = msg.role === 'USER' || msg.role?.toUpperCase() === 'USER';
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar
                        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                        style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }}
                      />
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
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
