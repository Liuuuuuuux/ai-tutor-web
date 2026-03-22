import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  List,
  Space,
  Tag,
  message,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useKnowledgePoints,
  useGenerateKnowledgePoints,
  useConfirmKnowledgePoints,
  useRegenerateKnowledgePoints,
  useDeleteKnowledgePoint,
  useUpdateMasteryLevel,
  useCreateKnowledgePoint,
  useUpdateKnowledgePoint,
} from '@/hooks';
import type { KnowledgePoint, GeneratedKnowledgePoint } from '@/types';
import { KnowledgePointStatus } from '@/types';

const statusConfig: Record<number, { color: string; text: string }> = {
  [KnowledgePointStatus.NOT_STARTED]: { color: 'default', text: '未开始' },
  [KnowledgePointStatus.LEARNING]: { color: 'processing', text: '学习中' },
  [KnowledgePointStatus.MASTERED]: { color: 'success', text: '已掌握' },
};

export function KnowledgePointsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generatedPoints, setGeneratedPoints] = useState<GeneratedKnowledgePoint[]>([]);
  const [generateForm] = Form.useForm();

  // 手动添加知识点
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  // 编辑知识点
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePoint | null>(null);
  const [editForm] = Form.useForm();

  const { data: knowledgePoints, isLoading } = useKnowledgePoints(goalId || '');
  const generateMutation = useGenerateKnowledgePoints();
  const confirmMutation = useConfirmKnowledgePoints();
  const regenerateMutation = useRegenerateKnowledgePoints();
  const deleteMutation = useDeleteKnowledgePoint();
  const updateMasteryMutation = useUpdateMasteryLevel();
  const createMutation = useCreateKnowledgePoint();
  const updateMutation = useUpdateKnowledgePoint();

  const handleSelect = (point: KnowledgePoint) => {
    navigate(`/learning-session/${goalId}/${point.id}`);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleMarkMastered = (id: string) => {
    updateMasteryMutation.mutate({ id, masteryLevel: 100 });
  };

  // 编辑知识点
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
          message.success('知识点更新成功');
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

  const handleBack = () => {
    navigate('/learning-goals');
  };

  // 手动添加知识点
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
    return <Empty description="请先选择学习目标" className="py-20" />;
  }

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="mb-4">
        返回
      </Button>

      <Card
        title="知识点列表"
        extra={
          <Space>
            <Button type="primary" icon={<RobotOutlined />} onClick={handleOpenGenerate}>
              AI 拆解知识点
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleOpenAdd}>
              手动添加
            </Button>
          </Space>
        }
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : knowledgePoints && knowledgePoints.length > 0 ? (
          <List
            dataSource={knowledgePoints}
            renderItem={(point: KnowledgePoint) => (
              <List.Item
                actions={[
                  <Tag key="status" color={statusConfig[point.status]?.color}>
                    {statusConfig[point.status]?.text}
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
                    title="确定删除此知识点吗？"
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
                    <Space>
                      {point.title}
                      {point.masteryLevel !== undefined && (
                        <Tag color="blue">{point.masteryLevel}%</Tag>
                      )}
                    </Space>
                  }
                  description={point.description || '暂无描述'}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无知识点，点击上方按钮让 AI 帮你拆解">
            <Button type="primary" icon={<RobotOutlined />} onClick={handleOpenGenerate}>
              AI 拆解知识点
            </Button>
          </Empty>
        )}
      </Card>

      {/* AI 拆解知识点弹窗 */}
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
        width={700}
      >
        <Form form={generateForm} layout="vertical">
          <Form.Item
            name="topic"
            label="学习主题"
            rules={[{ required: true, message: '请输入学习主题' }]}
          >
            <Input placeholder="例如：Redis、Spring Boot、微服务架构" />
          </Form.Item>
          <Form.Item name="userBackground" label="学习背景（可选）">
            <Input.TextArea rows={2} placeholder="例如：有 Java 基础，了解数据库基本概念" />
          </Form.Item>
          <Form.Item name="expectedCount" label="预计知识点数量" initialValue={5}>
            <InputNumber min={3} max={15} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="difficultyLevel" label="难度级别" initialValue="MEDIUM">
            <Select>
              <Select.Option value="EASY">入门级</Select.Option>
              <Select.Option value="MEDIUM">中级</Select.Option>
              <Select.Option value="HARD">高级</Select.Option>
            </Select>
          </Form.Item>
        </Form>

        {generatedPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2">拆解结果（可编辑标题和描述）</h4>
            <List
              dataSource={generatedPoints}
              renderItem={(point, index) => (
                <List.Item>
                  <div className="w-full">
                    <Space className="w-full" direction="vertical" style={{ width: '100%' }}>
                      <Input
                        value={point.title}
                        onChange={(e) => {
                          const newPoints = [...generatedPoints];
                          newPoints[index] = { ...newPoints[index], title: e.target.value };
                          setGeneratedPoints(newPoints);
                        }}
                        placeholder="知识点标题"
                      />
                      <Input.TextArea
                        value={point.description}
                        onChange={(e) => {
                          const newPoints = [...generatedPoints];
                          newPoints[index] = { ...newPoints[index], description: e.target.value };
                          setGeneratedPoints(newPoints);
                        }}
                        rows={2}
                        placeholder="知识点描述"
                      />
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* 手动添加知识点弹窗 */}
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
            <Input.TextArea rows={3} placeholder="描述该知识点的主要内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑知识点弹窗 */}
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
            <Input.TextArea rows={3} placeholder="描述该知识点的主要内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
