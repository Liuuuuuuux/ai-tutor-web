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
  [LearningGoalStatus.ACTIVE]: { color: '#0f766e', text: '进行中' },
  [LearningGoalStatus.COMPLETED]: { color: '#16a34a', text: '已完成' },
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
    navigate(`/knowledge-points/${goal.id}`);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/20 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_55%,#115e59_100%)] px-6 py-8 text-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.55)] md:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <Tag color="success" className="rounded-full border-0 px-3 py-1 text-xs font-medium">
              学习空间
            </Tag>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                把英语、Java、网络学习，放进一个像 ChatGPT 一样的空间里
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                先选一个学习空间，再按知识点展开对话。你可以整体学习，也可以只盯着一个知识点追问到底。
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
                进入学习空间
              </Button>
            </Space>
          </div>

          <Card className="rounded-[28px] border-0 bg-white/10 text-white shadow-none backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              <Statistic title="学习空间" value={goals.length} valueStyle={{ color: '#fff' }} />
              <Statistic title="进行中" value={activeCount} valueStyle={{ color: '#fff' }} />
              <Statistic title="已完成" value={completedCount} valueStyle={{ color: '#fff' }} />
              <Statistic
                title="平均进度"
                value={avgProgress}
                suffix="%"
                valueStyle={{ color: '#fff' }}
              />
            </div>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ThunderboltOutlined className="text-amber-300" />
                推荐路径
              </div>
              <div className="space-y-2 text-sm text-white/75">
                <div>1. 选择一个学习空间</div>
                <div>2. 点开某个知识点开始聊天</div>
                <div>3. 用教学 / 引导模式持续推进</div>
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
                    className="rounded-[20px] border border-slate-100 px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/40"
                    actions={[
                      <Button
                        key="learn"
                        type="primary"
                        ghost
                        icon={<PlayCircleOutlined />}
                        onClick={() => openSpace(goal)}
                      >
                        进入
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
          <Card title="这是怎么学习的" className="h-full">
            <div className="space-y-4">
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <BookOutlined className="text-teal-600" />
                  整体学习
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  先把整个课程当作一个学习空间，适合建立框架、梳理目录和总览知识结构。
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <MessageOutlined className="text-teal-600" />
                  按知识点聊
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  点击某个知识点，直接进入聊天页面，像和老师连续问答一样把它学透。
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <ClockCircleOutlined className="text-teal-600" />
                  复习与回看
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  通过历史会话、统计和测验，把学习空间变成一条持续推进的学习路径。
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
