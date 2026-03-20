import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Radio, Button, Spin, Empty, Descriptions } from 'antd';
import { ArrowLeftOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ChatBox } from '@/components';
import { useLearningSession, useSessionMessages, useCreateLearningSession } from '@/hooks';
import { useLearningStore } from '@/stores';
import type { KnowledgePoint } from '@/types';

export function LearningSessionPage() {
  const { goalId, pointId } = useParams<{ goalId: string; pointId: string }>();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);

  const { mode, setMode, setCurrentSession, setCurrentKnowledgePoint } = useLearningStore();
  const createSessionMutation = useCreateLearningSession();

  // 创建会话
  useEffect(() => {
    if (goalId && pointId && !sessionId) {
      createSessionMutation.mutate(
        {
          goalId,
          knowledgePointId: pointId,
          mode,
        },
        {
          onSuccess: (session) => {
            setSessionId(session.id);
            setCurrentSession(session);
            setCurrentKnowledgePoint({
              id: pointId,
              goalId,
              title: '知识点',
              description: '',
              level: 0,
              order: 0,
              status: 'LEARNING',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as KnowledgePoint);
          },
        }
      );
    }
  }, [
    goalId,
    pointId,
    sessionId,
    mode,
    createSessionMutation,
    setCurrentSession,
    setCurrentKnowledgePoint,
  ]);

  const { data: session } = useLearningSession(sessionId || '');
  const { data: messages } = useSessionMessages(sessionId || '');

  const handleBack = () => {
    navigate(`/knowledge-points/${goalId}`);
  };

  const handleModeChange = (newMode: 'TEACHING' | 'COACH') => {
    setMode(newMode);
    // 切换模式时需要重新创建会话
    setSessionId(null);
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
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="mb-4">
        返回知识点
      </Button>

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
          </Card>

          {session && (
            <Card title="会话信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="状态">{session.status}</Descriptions.Item>
                <Descriptions.Item label="进度">{session.progress}%</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>

        {/* 右侧聊天区域 */}
        <div className="lg:col-span-3">
          {sessionId ? (
            <ChatBox sessionId={sessionId} initialMessages={messages || []} />
          ) : (
            <Empty description="正在加载会话..." className="py-20" />
          )}
        </div>
      </div>
    </div>
  );
}
