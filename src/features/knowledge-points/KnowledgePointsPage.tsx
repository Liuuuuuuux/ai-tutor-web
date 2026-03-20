import { useParams } from 'react-router-dom';
import { Card, Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { KnowledgeTree } from '@/components';
import { useKnowledgeTree, useDecomposeKnowledgePoint } from '@/hooks';

export function KnowledgePointsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();

  const { data: treeData, isLoading } = useKnowledgeTree(goalId || '');
  const decomposeMutation = useDecomposeKnowledgePoint();

  const handleSelect = (point: { id: string }) => {
    // 跳转到学习会话页面
    navigate(`/learning-session/${goalId}/${point.id}`);
  };

  const handleDecompose = (id: string) => {
    decomposeMutation.mutate(id);
  };

  const handleBack = () => {
    navigate('/learning-goals');
  };

  if (!goalId) {
    return <Empty description="请先选择学习目标" className="py-20" />;
  }

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="mb-4">
        返回
      </Button>

      <Card title="知识点树">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <KnowledgeTree
            data={treeData || []}
            loading={isLoading}
            onSelect={handleSelect}
            onDecompose={handleDecompose}
          />
        )}
      </Card>
    </div>
  );
}
