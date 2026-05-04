import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
} from 'antd';
import {
  useConfirmKnowledgePoints,
  useCreateKnowledgePoint,
  useDeleteKnowledgePoint,
  useGenerateKnowledgePoints,
  useKnowledgePoints,
  useRegenerateKnowledgePoints,
  useUpdateKnowledgePoint,
  useUpdateMasteryLevel,
} from '@/hooks';
import type { GeneratedKnowledgePoint, KnowledgePoint } from '@/types';
import { KnowledgePointStatus } from '@/types';

const statusConfig: Record<number, { color: string; text: string }> = {
  [KnowledgePointStatus.NOT_STARTED]: { color: 'default', text: '未开始' },
  [KnowledgePointStatus.LEARNING]: { color: 'processing', text: '学习中' },
  [KnowledgePointStatus.MASTERED]: { color: 'success', text: '已掌握' },
};

const getStatusConfig = (status: number) =>
  statusConfig[status] ?? { color: 'default', text: '未知' };

export function KnowledgePointsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generatedPoints, setGeneratedPoints] = useState<GeneratedKnowledgePoint[]>([]);
  const [generateForm] = Form.useForm();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePoint | null>(null);
  const [editForm] = Form.useForm();

  const { data: knowledgePoints, isLoading } = useKnowledgePoints(goalId || '');
  const safeKnowledgePoints = Array.isArray(knowledgePoints) ? knowledgePoints : [];
  const generateMutation = useGenerateKnowledgePoints();
  const confirmMutation = useConfirmKnowledgePoints();
  const regenerateMutation = useRegenerateKnowledgePoints();
  const deleteMutation = useDeleteKnowledgePoint();
  const updateMasteryMutation = useUpdateMasteryLevel();
  const createMutation = useCreateKnowledgePoint();
  const updateMutation = useUpdateKnowledgePoint();

  const handleSelect = (point: KnowledgePoint) => {
    if (!goalId || !point.id) return;
    navigate(`/learning-session/${goalId}/${point.id}`);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleMarkMastered = (id: string) => {
    updateMasteryMutation.mutate({ id, masteryLevel: 100 });
  };

  const handleOpenEdit = (point: KnowledgePoint) => {
    setEditingPoint(point);
    editForm.setFieldsValue({
      title: point.title,
      description: point.description,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingPoint) return;
    const values = await editForm.validateFields();
    updateMutation.mutate(
      {
        id: editingPoint.id,
        data: {
          title: values.title,
          description: values.description,
        },
      },
      {
        onSuccess: () => {
          message.success('知识点已更新');
          setEditModalOpen(false);
          setEditingPoint(null);
        },
      }
    );
  };

  const handleOpenGenerate = () => {
    generateForm.resetFields();
    setGeneratedPoints([]);
    setGenerateModalOpen(true);
  };

  const handleGenerate = async () => {
    const values = await generateForm.validateFields();
    generateMutation.mutate(
      {
        goalId: goalId!,
        topic: values.topic,
        userBackground: values.userBackground,
        expectedCount: values.expectedCount,
        difficultyLevel: values.difficultyLevel,
      },
      {
        onSuccess: (result) => {
          setGeneratedPoints(result.points);
          message.success('知识点拆解完成');
        },
      }
    );
  };

  const handleConfirm = () => {
    if (generatedPoints.length === 0) {
      message.warning('没有可保存的知识点');
      return;
    }

    confirmMutation.mutate(
      { goalId: goalId!, points: generatedPoints },
      {
        onSuccess: () => {
          message.success('知识点已保存');
          setGenerateModalOpen(false);
          setGeneratedPoints([]);
        },
      }
    );
  };

  const handleRegenerate = () => {
    const values = generateForm.getFieldsValue();
    regenerateMutation.mutate(
      {
        goalId: goalId!,
        topic: values.topic,
        userBackground: values.userBackground,
        expectedCount: values.expectedCount,
        difficultyLevel: values.difficultyLevel,
      },
      {
        onSuccess: () => {
          message.success('知识点已重新生成');
          setGenerateModalOpen(false);
          setGeneratedPoints([]);
        },
      }
    );
  };

  const handleOpenAdd = () => {
    addForm.resetFields();
    setAddModalOpen(true);
  };

  const handleAdd = async () => {
    const values = await addForm.validateFields();
    createMutation.mutate(
      {
        goalId: goalId!,
        title: values.title,
        description: values.description,
      },
      {
        onSuccess: () => {
          message.success('知识点添加成功');
          setAddModalOpen(false);
        },
      }
    );
  };

  if (!goalId) {
    return <Empty description="请先选择一个学习空间" className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/learning-goals')}>
        返回学习空间
      </Button>

      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)] text-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              Knowledge Map
            </div>
            <h1 className="mt-2 text-3xl font-semibold">知识点树</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              先拆出知识点，再选择某个点进入聊天学习。你也可以让 AI 自动帮你生成一版知识点结构。
            </p>
          </div>
          <Space wrap>
            <Button
              size="large"
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleOpenGenerate}
            >
              AI 拆解知识点
            </Button>
            <Button size="large" ghost icon={<PlusOutlined />} onClick={handleOpenAdd}>
              手动添加
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="知识点列表">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : safeKnowledgePoints.length > 0 ? (
          <List
            dataSource={safeKnowledgePoints}
            renderItem={(point: KnowledgePoint) => (
              <List.Item
                className="rounded-[20px] border border-slate-100 px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/40"
                actions={[
                  <Tag key="status" color={getStatusConfig(point.status).color}>
                    {getStatusConfig(point.status).text}
                  </Tag>,
                  <Button key="learn" type="link" onClick={() => handleSelect(point)}>
                    学习
                  </Button>,
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleOpenEdit(point)}
                  >
                    编辑
                  </Button>,
                  point.status !== KnowledgePointStatus.MASTERED && (
                    <Button key="master" type="link" onClick={() => handleMarkMastered(point.id)}>
                      标记已掌握
                    </Button>
                  ),
                  <Popconfirm
                    key="delete"
                    title="确定删除这个知识点吗？"
                    onConfirm={() => handleDelete(point.id)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <span className="text-base font-medium text-slate-900">{point.title}</span>
                      <Tag color="blue">{point.masteryLevel ?? 0}%</Tag>
                    </Space>
                  }
                  description={point.description || '暂无描述'}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="还没有知识点，先让 AI 帮你拆解一版">
            <Button type="primary" icon={<RobotOutlined />} onClick={handleOpenGenerate}>
              AI 拆解知识点
            </Button>
          </Empty>
        )}
      </Card>

      <Modal
        title="AI 拆解知识点"
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        footer={
          generatedPoints.length > 0
            ? [
                <Button key="cancel" onClick={() => setGenerateModalOpen(false)}>
                  取消
                </Button>,
                <Button
                  key="regenerate"
                  onClick={handleRegenerate}
                  loading={regenerateMutation.isPending}
                >
                  重新生成
                </Button>,
                <Button
                  key="confirm"
                  type="primary"
                  onClick={handleConfirm}
                  loading={confirmMutation.isPending}
                >
                  确认保存
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setGenerateModalOpen(false)}>
                  取消
                </Button>,
                <Button
                  key="generate"
                  type="primary"
                  onClick={handleGenerate}
                  loading={generateMutation.isPending}
                >
                  开始拆解
                </Button>,
              ]
        }
        width={760}
      >
        <Form form={generateForm} layout="vertical">
          <Form.Item
            name="topic"
            label="学习主题"
            rules={[{ required: true, message: '请输入学习主题' }]}
          >
            <Input placeholder="例如：Redis、Spring Boot、英语语法、计算机网络" />
          </Form.Item>
          <Form.Item name="userBackground" label="学习背景（可选）">
            <Input.TextArea rows={2} placeholder="例如：有 Java 基础，了解数据库基本概念" />
          </Form.Item>
          <Form.Item name="expectedCount" label="预计知识点数量" initialValue={5}>
            <InputNumber min={3} max={15} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="difficultyLevel" label="难度级别" initialValue="MEDIUM">
            <Select
              options={[
                { label: '入门', value: 'EASY' },
                { label: '中级', value: 'MEDIUM' },
                { label: '高级', value: 'HARD' },
              ]}
            />
          </Form.Item>
        </Form>

        {generatedPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-3">拆解结果</h4>
            <List
              dataSource={generatedPoints}
              renderItem={(point, index) => (
                <List.Item>
                  <div className="w-full space-y-3">
                    <Input
                      value={point.title}
                      onChange={(e) => {
                        const next = [...generatedPoints];
                        next[index] = { ...next[index], title: e.target.value };
                        setGeneratedPoints(next);
                      }}
                      placeholder="知识点标题"
                    />
                    <Input.TextArea
                      value={point.description}
                      onChange={(e) => {
                        const next = [...generatedPoints];
                        next[index] = { ...next[index], description: e.target.value };
                        setGeneratedPoints(next);
                      }}
                      rows={2}
                      placeholder="知识点描述"
                    />
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="手动添加知识点"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddModalOpen(false)}>
            取消
          </Button>,
          <Button key="add" type="primary" onClick={handleAdd} loading={createMutation.isPending}>
            添加
          </Button>,
        ]}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="title"
            label="知识点标题"
            rules={[{ required: true, message: '请输入知识点标题' }]}
          >
            <Input placeholder="例如：Spring IoC 容器" />
          </Form.Item>
          <Form.Item name="description" label="知识点描述">
            <Input.TextArea rows={3} placeholder="描述一下这个知识点的核心内容" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑知识点"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingPoint(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditModalOpen(false);
              setEditingPoint(null);
            }}
          >
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleEdit} loading={updateMutation.isPending}>
            保存
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="知识点标题"
            rules={[{ required: true, message: '请输入知识点标题' }]}
          >
            <Input placeholder="例如：Spring IoC 容器" />
          </Form.Item>
          <Form.Item name="description" label="知识点描述">
            <Input.TextArea rows={3} placeholder="描述一下这个知识点的核心内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
