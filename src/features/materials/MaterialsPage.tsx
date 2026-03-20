import { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Upload,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMaterials, useCreateMaterial, useDeleteMaterial } from '@/hooks';
import type { Material } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';

const typeConfig = {
  PDF: { icon: <FilePdfOutlined />, color: '#f5222d' },
  VIDEO: { icon: <VideoCameraOutlined />, color: '#1890ff' },
  LINK: { icon: <LinkOutlined />, color: '#52c41a' },
  TEXT: { icon: <FileTextOutlined />, color: '#722ed1' },
};

export function MaterialsPage() {
  const [goalId, setGoalId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useMaterials(goalId);
  const createMutation = useCreateMaterial();
  const deleteMutation = useDeleteMaterial();

  const handleCreate = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  const uploadProps: UploadProps = {
    beforeUpload: async () => {
      // 这里可以实现文件上传逻辑
      message.info('文件上传功能待实现');
      return false;
    },
    showUploadList: false,
  };

  const columns: ColumnsType<Material> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: keyof typeof typeConfig) => (
        <span style={{ color: typeConfig[type]?.color }}>
          {typeConfig[type]?.icon}
          <span className="ml-1">{type}</span>
        </span>
      ),
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size?: number) => (size ? `${(size / 1024).toFixed(2)} KB` : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            查看
          </a>
          <Popconfirm title="确定删除此资料吗？" onConfirm={() => handleDelete(record.id)}>
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
        title="学习资料管理"
        extra={
          <Space>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              添加资料
            </Button>
          </Space>
        }
      >
        <div className="mb-4">
          <Select
            style={{ width: 200 }}
            placeholder="选择学习目标"
            onChange={setGoalId}
            allowClear
          />
        </div>

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
        title="添加学习资料"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="goalId"
            label="学习目标"
            rules={[{ required: true, message: '请选择学习目标' }]}
          >
            <Select placeholder="请选择学习目标" />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入资料标题" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择资料类型">
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="VIDEO">视频</Select.Option>
              <Select.Option value="LINK">链接</Select.Option>
              <Select.Option value="TEXT">文本</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="url" label="链接" rules={[{ required: true, message: '请输入链接' }]}>
            <Input placeholder="请输入资料链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
