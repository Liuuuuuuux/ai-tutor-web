import { Card, Row, Col, Statistic, Progress, List, Button, Space, Empty, Spin } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLearningGoals } from '@/hooks';
import type { LearningGoal } from '@/types';
import { LearningGoalStatus } from '@/types';

const statusConfig: Record<number, { color: string; text: string }> = {
  [LearningGoalStatus.ACTIVE]: { color: '#1890ff', text: '进行中' },
  [LearningGoalStatus.COMPLETED]: { color: '#52c41a', text: '已完成' },
  [LearningGoalStatus.PAUSED]: { color: '#faad14', text: '已暂停' },
};

export function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useLearningGoals();

  const goals = data?.records || [];

  // 统计数据
  const activeCount = goals.filter((g) => g.status === LearningGoalStatus.ACTIVE).length;
  const completedCount = goals.filter((g) => g.status === LearningGoalStatus.COMPLETED).length;
  const totalCount = goals.length;
  const avgProgress =
    totalCount > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalCount)
      : 0;

  // 最近的学习目标（取前5个）
  const recentGoals = goals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-2">欢迎来到 AI Tutor</h2>
          <p className="opacity-90">使用费曼学习法，让 AI 成为你最好的学习伙伴</p>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习目标总数"
              value={totalCount}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={activeCount}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#87d068' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均进度"
              value={avgProgress}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速入口 */}
      <Card title="快速入口">
        <Space size="large">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/learning-goals')}
          >
            创建学习目标
          </Button>
          <Button icon={<BookOutlined />} size="large" onClick={() => navigate('/learning-goals')}>
            查看全部目标
          </Button>
        </Space>
      </Card>

      {/* 最近学习目标 */}
      <Card
        title="最近学习目标"
        extra={
          <Button type="link" onClick={() => navigate('/learning-goals')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : recentGoals.length > 0 ? (
          <List
            dataSource={recentGoals}
            renderItem={(goal: LearningGoal) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key="learn"
                    onClick={() => navigate(`/knowledge-points/${goal.id}`)}
                  >
                    继续学习
                  </Button>,
                  <Button
                    type="link"
                    key="detail"
                    onClick={() => navigate(`/learning-goals/${goal.id}`)}
                  >
                    详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{goal.title}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: statusConfig[goal.status]?.color + '20',
                          color: statusConfig[goal.status]?.color,
                        }}
                      >
                        {statusConfig[goal.status]?.text}
                      </span>
                    </Space>
                  }
                  description={goal.description || '暂无描述'}
                />
                <div className="w-32">
                  <Progress percent={goal.progress || 0} size="small" />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无学习目标" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => navigate('/learning-goals')}>
              创建第一个学习目标
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
