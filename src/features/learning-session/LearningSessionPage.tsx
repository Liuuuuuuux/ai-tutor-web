import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, Spin, Empty, Descriptions, Modal, Result, List, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  BulbOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ChatBox } from '@/components';
import {
  useLearningSession,
  useCreateLearningSession,
  useCompleteSession,
  useCurrentSession,
  useKnowledgePoint,
} from '@/hooks';
import { useLearningStore } from '@/stores';
import { useQueryClient } from '@tanstack/react-query';
import type { SessionCompleteResult, ChatMessage, SessionMessage } from '@/types';
import { KnowledgePointStatus, LearningSessionStatus } from '@/types';

export function LearningSessionPage() {
  const { goalId, pointId } = useParams<{ goalId: string; pointId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeResult, setCompleteResult] = useState<SessionCompleteResult | null>(null);

  // 使用 ref 追踪是否已初始化，避免触发重新渲染
  const hasInitialized = useRef(false);

  const { mode, setMode, setCurrentSession, setCurrentKnowledgePoint } = useLearningStore();
  const createSessionMutation = useCreateLearningSession();
  const completeSessionMutation = useCompleteSession();

  // 获取知识点详情
  const { data: knowledgePoint } = useKnowledgePoint(pointId || '');

  // 检查是否有进行中的会话
  const { data: currentSession } = useCurrentSession(pointId || '');

  // 获取会话详情
  const { data: session } = useLearningSession(sessionId || '');

  // 从会话详情中获取消息，并转换为 ChatMessage 格式
  // 使用 session.messages 作为依赖（React Compiler 要求）
  const sessionMessages = session?.messages;
  const currentSessionId = sessionId || '';
  const messages: ChatMessage[] = useMemo(() => {
    if (!sessionMessages) return [];
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

    if (currentSession) {
      // 有进行中的会话，恢复它
      hasInitialized.current = true;
      setSessionId(currentSession.id);
      setCurrentSession(currentSession);
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
  }, [pointId, currentSession]);

  // 更新知识点信息
  useEffect(() => {
    if (knowledgePoint) {
      setCurrentKnowledgePoint(knowledgePoint);
    }
  }, [knowledgePoint, setCurrentKnowledgePoint]);

  const handleBack = () => {
    navigate(`/knowledge-points/${goalId}`);
  };

  const handleModeChange = (newMode: 'TEACHING' | 'COACH') => {
    // 切换模式需要确认
    Modal.confirm({
      title: '切换学习模式',
      content: '切换模式将开始新的学习会话，当前会话将被保留。确定要切换吗？',
      onOk: () => {
        setMode(newMode);
        setSessionId(null);
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

  if (createSessionMutation.isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="正在创建学习会话..." />
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
    </div>
  );
}
