import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined,
  BookOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, List, Progress, Row, Space, Spin, Statistic, Tag } from 'antd';
import { useLearningGoals } from '@/hooks';
import type { LearningGoal } from '@/types';
import { LearningGoalStatus } from '@/types';

const statusConfig: Record<number, { color: string; text: string }> = {
  [LearningGoalStatus.ACTIVE]: { color: '#2563eb', text: '进行中' },
  [LearningGoalStatus.COMPLETED]: { color: '#1d4ed8', text: '已完成' },
  [LearningGoalStatus.PAUSED]: { color: '#ca8a04', text: '已暂停' },
};

export function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useLearningGoals();

  const goals = data?.records || [];
  const activeCount = goals.filter((goal) => goal.status === LearningGoalStatus.ACTIVE).length;
  const completedCount = goals.filter(
    (goal) => goal.status === LearningGoalStatus.COMPLETED
  ).length;
  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0;

  const recentGoals = goals.slice(0, 4);

  const openSpace = (goal: LearningGoal) => {
    navigate(`/learning-session/${goal.id}`);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-8 text-slate-900 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.12)] md:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <Tag color="blue" className="rounded-full border-0 px-3 py-1 text-xs font-medium">
              学习空间
            </Tag>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                把知识点整理好，然后直接进入对话式学习
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                现在进入学习空间后会直接打开聊天页。知识点、历史记录和模式切换都收进一个更干净的界面里。
              </p>
            </div>
            <Space wrap>
              <Button
                size="large"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/learning-goals')}
              >
                新建学习空间
              </Button>
              <Button
                size="large"
                ghost
                icon={<MessageOutlined />}
                onClick={() => navigate('/learning-goals')}
              >
                直接进入聊天
              </Button>
            </Space>
          </div>

          <Card className="rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-none backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              <Statistic title="学习空间" value={goals.length} valueStyle={{ color: '#0f172a' }} />
              <Statistic title="进行中" value={activeCount} valueStyle={{ color: '#0f172a' }} />
              <Statistic title="已完成" value={completedCount} valueStyle={{ color: '#0f172a' }} />
              <Statistic
                title="平均进度"
                value={avgProgress}
                suffix="%"
                valueStyle={{ color: '#0f172a' }}
              />
            </div>
            <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ThunderboltOutlined className="text-blue-600" />
                推荐路径
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div>1. 选一个学习空间</div>
                <div>2. 直接进入聊天页</div>
                <div>3. 需要时再打开抽屉切换知识点</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={15}>
          <Card
            title="最近的学习空间"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/learning-goals')}
              >
                查看全部
              </Button>
            }
            className="overflow-hidden"
          >
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spin />
              </div>
            ) : recentGoals.length > 0 ? (
              <List
                dataSource={recentGoals}
                renderItem={(goal: LearningGoal) => (
                  <List.Item
                    className="rounded-[20px] border border-slate-100 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/60"
                    actions={[
                      <Button
                        key="learn"
                        type="primary"
                        ghost
                        icon={<PlayCircleOutlined />}
                        onClick={() => openSpace(goal)}
                      >
                        进入聊天
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <span className="text-base font-medium text-slate-900">{goal.title}</span>
                          <Tag
                            color={statusConfig[goal.status]?.color}
                            className="rounded-full border-0 px-3"
                          >
                            {statusConfig[goal.status]?.text}
                          </Tag>
                        </Space>
                      }
                      description={goal.description || '暂无描述'}
                    />
                    <div className="w-40">
                      <Progress percent={goal.progress || 0} size="small" />
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="还没有创建学习空间" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={() => navigate('/learning-goals')}>
                  创建第一个学习空间
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card title="学习方式" className="h-full">
            <div className="space-y-4">
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <BookOutlined className="text-blue-600" />
                  整体学习
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  把整个课程当成一个学习空间，适合建立框架、梳理目录和总览知识结构。
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <MessageOutlined className="text-blue-600" />
                  直接聊天
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  进入后直接围绕某个知识点聊天，默认更像 AI 对话产品。
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <ClockCircleOutlined className="text-blue-600" />
                  复习与回看
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  历史记录、完成学习和回看内容都保留，但不再抢占主界面。
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
