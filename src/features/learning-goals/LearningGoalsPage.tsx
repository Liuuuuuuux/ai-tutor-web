import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Progress, Space, Table, Tag } from 'antd';
import {
  useCreateLearningGoal,
  useDeleteLearningGoal,
  useLearningGoals,
  useUpdateLearningGoal,
} from '@/hooks';
import type { LearningGoal } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const statusConfig: Record<number, { color: string; text: string }> = {
  0: { color: 'processing', text: '进行中' },
  1: { color: 'success', text: '已完成' },
  2: { color: 'warning', text: '已暂停' },
};

export function LearningGoalsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useLearningGoals();
  const createMutation = useCreateLearningGoal();
  const updateMutation = useUpdateLearningGoal();
  const deleteMutation = useDeleteLearningGoal();

  const handleCreate = () => {
    setEditingGoal(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (goal: LearningGoal) => {
    setEditingGoal(goal);
    form.setFieldsValue(goal);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingGoal) {
      updateMutation.mutate(
        { id: editingGoal.id, data: values },
        { onSuccess: () => setModalOpen(false) }
      );
      return;
    }

    createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  const handleStartLearning = (goal: LearningGoal) => {
    navigate(`/knowledge-points/${goal.id}`);
  };

  const columns: ColumnsType<LearningGoal> = [
    {
      title: '学习空间',
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{record.description || '暂无描述'}</div>
        </div>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 180,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: number) => (
        <Tag color={statusConfig[status]?.color} className="rounded-full border-0 px-3">
          {statusConfig[status]?.text}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartLearning(record)}
          >
            进入
          </Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除这个学习空间吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)] text-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              Learning Space
            </div>
            <h1 className="mt-2 text-3xl font-semibold">学习空间管理</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              在这里创建、编辑和进入你的课程空间。每个空间都可以继续拆成知识点，再进入聊天式学习。
            </p>
          </div>
          <Button size="large" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建学习空间
          </Button>
        </div>
      </Card>

      <Card
        title="空间列表"
        extra={
          <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.records || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: data?.total || 0,
            pageSize: data?.size || 10,
            current: data?.current || 1,
          }}
        />
      </Card>

      <Modal
        title={editingGoal ? '编辑学习空间' : '新建学习空间'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="学习空间名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：英语、Java、网络基础" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="写下这个学习空间要学什么、适合谁、预计怎么学" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
