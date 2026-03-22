import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Progress, Button, Space, Tag, Spin, Empty, List } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useLearningGoal, useKnowledgeTree } from '@/hooks';
import type { KnowledgePoint } from '@/types';
import { LearningGoalStatus, KnowledgePointStatus } from '@/types';

const statusConfig: Record<number, { color: string; text: string }> = {
  [LearningGoalStatus.ACTIVE]: { color: 'processing', text: '进行中' },
  [LearningGoalStatus.COMPLETED]: { color: 'success', text: '已完成' },
  [LearningGoalStatus.PAUSED]: { color: 'warning', text: '已暂停' },
};

const pointStatusConfig: Record<number, { color: string; text: string }> = {
  [KnowledgePointStatus.NOT_STARTED]: { color: 'default', text: '未开始' },
  [KnowledgePointStatus.LEARNING]: { color: 'processing', text: '学习中' },
  [KnowledgePointStatus.MASTERED]: { color: 'success', text: '已掌握' },
};

export function LearningGoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: goal, isLoading: goalLoading } = useLearningGoal(id || '');
  const { data: knowledgeTree, isLoading: treeLoading } = useKnowledgeTree(id || '');

  const isLoading = goalLoading || treeLoading;

  // 导航到知识点页面
  const goToKnowledgePoints = () => {
    if (id) {
      navigate(`/knowledge-points/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!goal) {
    return (
      <Empty description="学习目标不存在">
        <Button onClick={() => navigate('/learning-goals')}>返回列表</Button>
      </Empty>
    );
  }

  // 统计知识点状态
  const flattenPoints = (points: KnowledgePoint[]): KnowledgePoint[] => {
    return points.reduce<KnowledgePoint[]>((acc, point) => {
      acc.push(point);
      if (point.children) {
        acc.push(...flattenPoints(point.children));
      }
      return acc;
    }, []);
  };

  const allPoints = knowledgeTree ? flattenPoints(knowledgeTree) : [];
  const masteredCount = allPoints.filter((p) => p.status === KnowledgePointStatus.MASTERED).length;
  const learningCount = allPoints.filter((p) => p.status === KnowledgePointStatus.LEARNING).length;
  const notStartedCount = allPoints.filter(
    (p) => p.status === KnowledgePointStatus.NOT_STARTED
  ).length;

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/learning-goals')}>
        返回列表
      </Button>

      {/* 基本信息 */}
      <Card title="学习目标信息">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="标题">{goal.title}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusConfig[goal.status]?.color}>{statusConfig[goal.status]?.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="进度">
            <Progress percent={goal.progress || 0} size="small" style={{ width: 120 }} />
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={3}>
            {goal.description || '暂无描述'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {goal.createTime ? new Date(goal.createTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {goal.updateTime ? new Date(goal.updateTime).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 学习进度统计 */}
      <Card title="知识点进度">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-500">{notStartedCount}</div>
            <div className="text-gray-500">未开始</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-500">{learningCount}</div>
            <div className="text-gray-500">学习中</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-500">{masteredCount}</div>
            <div className="text-gray-500">已掌握</div>
          </div>
        </div>

        <div className="mb-4">
          <Progress
            percent={
              allPoints.length > 0 ? Math.round((masteredCount / allPoints.length) * 100) : 0
            }
            format={() => `${masteredCount}/${allPoints.length} 知识点`}
          />
        </div>
      </Card>

      {/* 知识点列表 */}
      <Card
        title="知识点列表"
        extra={
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={goToKnowledgePoints}>
            开始学习
          </Button>
        }
      >
        {allPoints.length > 0 ? (
          <List
            dataSource={allPoints}
            renderItem={(point: KnowledgePoint) => (
              <List.Item
                actions={[
                  <Tag key="status" color={pointStatusConfig[point.status]?.color}>
                    {pointStatusConfig[point.status]?.text}
                  </Tag>,
                  <Button
                    key="learn"
                    type="link"
                    onClick={() => {
                      if (id && point.id) {
                        navigate(`/learning-session/${id}/${point.id}`);
                      }
                    }}
                  >
                    学习
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span style={{ paddingLeft: ((point.level || 1) - 1) * 20 }}>
                      {point.title}
                    </span>
                  }
                  description={point.description || '暂无描述'}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-10">
            <Empty description="暂无知识点">
              <Button type="primary" onClick={goToKnowledgePoints}>
                开始拆解知识点
              </Button>
            </Empty>
          </div>
        )}
      </Card>

      {/* 快捷操作 */}
      <Card title="快捷操作">
        <Space>
          <Button onClick={goToKnowledgePoints}>管理知识点</Button>
          <Button
            onClick={() => {
              if (id) {
                navigate(`/exam?goalId=${id}`);
              }
            }}
          >
            生成试卷
          </Button>
          <Button
            onClick={() => {
              if (id) {
                navigate(`/materials?goalId=${id}`);
              }
            }}
          >
            管理资料
          </Button>
        </Space>
      </Card>
    </div>
  );
}
