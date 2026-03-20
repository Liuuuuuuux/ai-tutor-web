import { useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Progress, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useLearningGoals,
  useCreateLearningGoal,
  useUpdateLearningGoal,
  useDeleteLearningGoal,
} from '@/hooks';
import type { LearningGoal } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const statusConfig = {
  ACTIVE: { color: 'processing', text: '进行中' },
  COMPLETED: { color: 'success', text: '已完成' },
  PAUSED: { color: 'warning', text: '已暂停' },
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
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleStartLearning = (goal: LearningGoal) => {
    navigate(`/knowledge-points/${goal.id}`);
  };

  const columns: ColumnsType<LearningGoal> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartLearning(record)}
          >
            学习
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此学习目标吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="学习目标管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建目标
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
        title={editingGoal ? '编辑学习目标' : '新建学习目标'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入学习目标标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="请输入学习目标描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
