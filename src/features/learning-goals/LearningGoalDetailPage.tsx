import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
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

  const goToKnowledgePoints = () => {
    if (id) {
      navigate(`/knowledge-points/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!goal) {
    return (
      <Empty description="学习空间不存在" className="py-20">
        <Button onClick={() => navigate('/learning-goals')}>返回学习空间</Button>
      </Empty>
    );
  }

  const flattenPoints = (points: KnowledgePoint[]): KnowledgePoint[] =>
    points.reduce<KnowledgePoint[]>((acc, point) => {
      acc.push(point);
      if (point.children) {
        acc.push(...flattenPoints(point.children));
      }
      return acc;
    }, []);

  const allPoints = knowledgeTree ? flattenPoints(knowledgeTree) : [];
  const masteredCount = allPoints.filter(
    (point) => point.status === KnowledgePointStatus.MASTERED
  ).length;
  const learningCount = allPoints.filter(
    (point) => point.status === KnowledgePointStatus.LEARNING
  ).length;
  const notStartedCount = allPoints.filter(
    (point) => point.status === KnowledgePointStatus.NOT_STARTED
  ).length;

  return (
    <div className="space-y-6">
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/learning-goals')}>
        返回学习空间
      </Button>

      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)] text-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <Tag color="success" className="rounded-full border-0 px-3 py-1 text-xs font-medium">
              学习空间详情
            </Tag>
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">{goal.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
                {goal.description || '暂无描述'}
              </p>
            </div>
          </div>
          <Space wrap>
            <Button
              size="large"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={goToKnowledgePoints}
            >
              开始学习
            </Button>
            <Button size="large" ghost onClick={() => navigate(`/exam?goalId=${id}`)}>
              生成测验
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <Card title="基本信息" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="状态">
                <Tag
                  color={statusConfig[goal.status]?.color}
                  className="rounded-full border-0 px-3"
                >
                  {statusConfig[goal.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={goal.progress || 0} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {goal.createTime ? new Date(goal.createTime).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {goal.updateTime ? new Date(goal.updateTime).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="知识点进度">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="rounded-[20px] bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{notStartedCount}</div>
                  <div className="mt-1 text-sm text-slate-500">未开始</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="rounded-[20px] bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-orange-500">{learningCount}</div>
                  <div className="mt-1 text-sm text-slate-500">学习中</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="rounded-[20px] bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-emerald-600">{masteredCount}</div>
                  <div className="mt-1 text-sm text-slate-500">已掌握</div>
                </div>
              </Col>
            </Row>

            <div className="mt-5">
              <Progress
                percent={
                  allPoints.length > 0 ? Math.round((masteredCount / allPoints.length) * 100) : 0
                }
                format={() => `${masteredCount}/${allPoints.length} 个知识点`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="知识点列表"
        extra={
          <Button type="link" icon={<ArrowRightOutlined />} onClick={goToKnowledgePoints}>
            打开知识点树
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
          <Empty description="暂时没有知识点" />
        )}
      </Card>

      <Card title="快捷操作">
        <Space wrap>
          <Button onClick={goToKnowledgePoints}>管理知识点</Button>
          <Button onClick={() => id && navigate(`/exam?goalId=${id}`)}>生成测验</Button>
          <Button onClick={() => id && navigate(`/materials?goalId=${id}`)}>管理资料</Button>
        </Space>
      </Card>
    </div>
  );
}
