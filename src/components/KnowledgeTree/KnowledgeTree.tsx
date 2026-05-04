import { Tree, Tag, Spin, Empty, Button } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { TreeProps } from 'antd';
import type { KnowledgePoint } from '@/types';
import { KnowledgePointStatus } from '@/types';

interface KnowledgeTreeProps {
  data: KnowledgePoint[];
  loading?: boolean;
  onSelect?: (point: KnowledgePoint) => void;
  onDecompose?: (id: string) => void;
}

const statusConfig: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
  [KnowledgePointStatus.NOT_STARTED]: {
    color: 'default',
    text: '未开始',
    icon: <ClockCircleOutlined />,
  },
  [KnowledgePointStatus.LEARNING]: {
    color: 'processing',
    text: '学习中',
    icon: <PlayCircleOutlined />,
  },
  [KnowledgePointStatus.MASTERED]: {
    color: 'blue',
    text: '已掌握',
    icon: <CheckCircleOutlined />,
  },
};

export function KnowledgeTree({ data, loading, onSelect, onDecompose }: KnowledgeTreeProps) {
  // 转换为 Ant Design Tree 数据格式
  const convertToTreeData = (points: KnowledgePoint[]): TreeProps['treeData'] => {
    return points.map((point) => ({
      key: point.id,
      title: (
        <div className="flex items-center gap-2">
          <span>{point.title}</span>
          <Tag color={statusConfig[point.status]?.color} className="ml-2">
            {statusConfig[point.status]?.icon}
            <span className="ml-1">{statusConfig[point.status]?.text}</span>
          </Tag>
          {point.masteryLevel !== undefined && point.masteryLevel > 0 && (
            <span className="text-xs text-gray-500">{point.masteryLevel}%</span>
          )}
        </div>
      ),
      icon: <BookOutlined />,
      children: point.children ? convertToTreeData(point.children) : undefined,
      data: point,
    }));
  };

  const handleSelect: TreeProps['onSelect'] = (_selectedKeys, info) => {
    if (onSelect && info.selectedNodes[0]) {
      const node = info.selectedNodes[0] as { data?: KnowledgePoint };
      if (node.data) {
        onSelect(node.data);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <Empty description="暂无知识点" className="py-10" />;
  }

  return (
    <div>
      <Tree
        showIcon
        defaultExpandAll
        treeData={convertToTreeData(data)}
        onSelect={handleSelect}
        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
      />
      {onDecompose && (
        <div className="mt-4">
          <Button type="primary" onClick={() => data[0] && onDecompose(data[0].id)}>
            AI 拆解知识点
          </Button>
        </div>
      )}
    </div>
  );
}
