import { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Select,
  Space,
  Popconfirm,
  Upload,
  message,
  List,
  Tag,
  Spin,
  Input,
} from 'antd';
import { DeleteOutlined, UploadOutlined, SearchOutlined, SaveOutlined } from '@ant-design/icons';
import {
  useMaterials,
  useUploadMaterial,
  useDeleteMaterial,
  useSearchMaterials,
  useSaveSearchResult,
  useBatchDeleteMaterials,
  useLearningGoals,
} from '@/hooks';
import type { Material, SearchResult } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';

const sourceConfig = {
  UPLOAD: { text: '上传', color: 'blue' },
  AI_SEARCH: { text: 'AI搜索', color: 'green' },
};

export function MaterialsPage() {
  const [goalId, setGoalId] = useState<string>('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { data: goalsData } = useLearningGoals();
  const { data, isLoading } = useMaterials({ goalId, pageNum: 1, pageSize: 10 });
  const uploadMutation = useUploadMaterial();
  const deleteMutation = useDeleteMaterial();
  const batchDeleteMutation = useBatchDeleteMaterials();
  const searchMutation = useSearchMaterials();
  const saveSearchMutation = useSaveSearchResult();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的资料');
      return;
    }
    batchDeleteMutation.mutate(selectedRowKeys, {
      onSuccess: () => {
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  const uploadProps: UploadProps = {
    beforeUpload: async (file) => {
      if (!goalId) {
        message.error('请先选择学习目标');
        return false;
      }

      uploadMutation.mutate(
        { goalId, file },
        {
          onSuccess: () => {
            message.success('上传成功');
          },
          onError: () => {
            message.error('上传失败');
          },
        }
      );
      return false; // 阻止默认上传行为
    },
    showUploadList: false,
    accept: '.pdf,.doc,.docx,.txt,.md',
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    if (!goalId) {
      message.warning('请先选择学习目标');
      return;
    }

    searchMutation.mutate(
      { goalId, keyword: searchQuery },
      {
        onSuccess: (results) => {
          setSearchResults(results);
        },
      }
    );
  };

  const handleSaveSearchResult = (result: SearchResult) => {
    saveSearchMutation.mutate(
      {
        goalId,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
      },
      {
        onSuccess: () => {
          message.success('已保存到资料库');
        },
      }
    );
  };

  const columns: ColumnsType<Material> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => (
        <Tag color={sourceConfig[source as keyof typeof sourceConfig]?.color}>
          {sourceConfig[source as keyof typeof sourceConfig]?.text}
        </Tag>
      ),
    },
    {
      title: '解析状态',
      dataIndex: 'parseStatus',
      key: 'parseStatus',
      width: 100,
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          PENDING: { color: 'processing', text: '解析中' },
          SUCCESS: { color: 'success', text: '成功' },
          FAILED: { color: 'error', text: '失败' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text || status}</Tag>;
      },
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size?: number) => (size ? `${(size / 1024).toFixed(2)} KB` : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.fileUrl && (
            <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
              查看
            </a>
          )}
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
              <Button icon={<UploadOutlined />} disabled={!goalId}>
                上传文件
              </Button>
            </Upload>
            <Button
              type="default"
              icon={<SearchOutlined />}
              onClick={() => setSearchModalOpen(true)}
              disabled={!goalId}
            >
              AI 搜索
            </Button>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 个资料吗？`}
                onConfirm={handleBatchDelete}
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
      >
        <div className="mb-4">
          <Select
            style={{ width: 200 }}
            placeholder="选择学习目标"
            onChange={setGoalId}
            allowClear
            value={goalId || undefined}
            options={goalsData?.records?.map((g) => ({ label: g.title, value: g.id })) || []}
          />
        </div>

        {!goalId ? (
          <div className="text-center py-10 text-gray-400">请先选择学习目标</div>
        ) : (
          <Table
            columns={columns}
            dataSource={data?.records || []}
            rowKey="id"
            loading={isLoading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
            pagination={{
              total: data?.total || 0,
              pageSize: data?.size || 10,
              current: data?.current || 1,
            }}
          />
        )}
      </Card>

      {/* AI 搜索弹窗 */}
      <Modal
        title="AI 联网搜索资料"
        open={searchModalOpen}
        onCancel={() => {
          setSearchModalOpen(false);
          setSearchResults([]);
          setSearchQuery('');
        }}
        footer={null}
        width={700}
      >
        <Space.Compact style={{ width: '100%' }} className="mb-4">
          <Input
            placeholder="输入搜索关键词，例如：Redis 持久化原理"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={searchMutation.isPending}
          >
            搜索
          </Button>
        </Space.Compact>

        {searchMutation.isPending && (
          <div className="text-center py-10">
            <Spin size="large" tip="正在搜索..." />
          </div>
        )}

        {searchResults.length > 0 && (
          <List
            header={<span>搜索结果（点击保存到资料库）</span>}
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="save"
                    type="link"
                    icon={<SaveOutlined />}
                    onClick={() => handleSaveSearchResult(item)}
                    loading={saveSearchMutation.isPending}
                  >
                    保存
                  </Button>,
                  <a key="view" href={item.url} target="_blank" rel="noopener noreferrer">
                    查看
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={
                    <>
                      <Tag>{item.source}</Tag>
                      <span className="text-gray-500">{item.snippet}</span>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {!searchMutation.isPending && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-10 text-gray-400">输入关键词开始搜索</div>
        )}
      </Modal>
    </div>
  );
}
