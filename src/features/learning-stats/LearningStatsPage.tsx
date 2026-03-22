import { Card, Row, Col, Statistic, Spin, Empty, Select, Space, Progress } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useLearningStatsOverview, useProgressCurve, useLearningGoals } from '@/hooks';
import { useState, useMemo } from 'react';

export function LearningStatsPage() {
  const [goalId, setGoalId] = useState<string | undefined>();
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useLearningStatsOverview();
  const { data: progressCurve, isLoading: curveLoading } = useProgressCurve({ goalId, days });
  const { data: goals } = useLearningGoals();

  const isLoading = overviewLoading || curveLoading;

  // 计算平均掌握程度
  const averageMasteryLevel = useMemo(() => {
    if (!overview) return 0;
    const total = overview.totalPoints || 0;
    if (total === 0) return 0;
    // 根据已掌握和学习中的比例估算
    const masteredRatio = (overview.masteredPoints || 0) / total;
    const learningRatio = (overview.learningPoints || 0) / total;
    // 假设已掌握=100%, 学习中=50%, 未开始=0%
    return Math.round(masteredRatio * 100 + learningRatio * 50);
  }, [overview]);

  return (
    <div className="space-y-6">
      <Card title="学习统计">
        {/* 筛选条件 */}
        <Space className="mb-4">
          <Select
            style={{ width: 200 }}
            placeholder="全部学习目标"
            allowClear
            onChange={setGoalId}
            options={goals?.records?.map((g) => ({ label: g.title, value: g.id })) || []}
          />
          <Select
            style={{ width: 120 }}
            value={days}
            onChange={setDays}
            options={[
              { label: '最近7天', value: 7 },
              { label: '最近30天', value: 30 },
              { label: '最近90天', value: 90 },
            ]}
          />
        </Space>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="学习目标"
                value={overview?.totalGoals || 0}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="知识点总数"
                value={overview?.totalPoints || 0}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已掌握"
                value={overview?.masteredPoints || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="学习时长"
                value={Math.floor((overview?.totalDuration || 0) / 60)}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 知识点状态分布 */}
      <Card title="知识点状态分布">
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="未开始"
                value={overview?.notStartedPoints || 0}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#999' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="学习中"
                value={overview?.learningPoints || 0}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已掌握"
                value={overview?.masteredPoints || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 进度曲线 */}
      <Card title="学习进度曲线">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : progressCurve?.dataPoints && progressCurve.dataPoints.length > 0 ? (
          <div className="space-y-4">
            {/* 简化的进度展示 */}
            <div className="grid grid-cols-7 gap-2">
              {progressCurve.dataPoints.slice(-14).map((item, index) => {
                const masteryLevel = item.afterLevel || item.beforeLevel || 0;
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {item.recordTime ? item.recordTime.slice(5, 10) : '-'}
                    </div>
                    <Progress
                      type="circle"
                      percent={masteryLevel}
                      size={50}
                      strokeColor={
                        masteryLevel >= 80 ? '#52c41a' : masteryLevel >= 60 ? '#faad14' : '#ff4d4f'
                      }
                      showInfo={false}
                    />
                    <div className="text-xs mt-1">{masteryLevel}%</div>
                  </div>
                );
              })}
            </div>
            {/* 详细数据表格 */}
            <div className="mt-4 border rounded p-4 max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">时间</th>
                    <th className="text-left py-2">知识点</th>
                    <th className="text-left py-2">学习前</th>
                    <th className="text-left py-2">学习后</th>
                    <th className="text-left py-2">学习时长</th>
                  </tr>
                </thead>
                <tbody>
                  {progressCurve.dataPoints.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.recordTime || '-'}</td>
                      <td className="py-2">{item.pointTitle || '-'}</td>
                      <td className="py-2">{item.beforeLevel || 0}%</td>
                      <td className="py-2">
                        <Progress
                          percent={item.afterLevel || 0}
                          size="small"
                          style={{ width: 100 }}
                          strokeColor={
                            (item.afterLevel || 0) >= 80
                              ? '#52c41a'
                              : (item.afterLevel || 0) >= 60
                                ? '#faad14'
                                : '#ff4d4f'
                          }
                        />
                      </td>
                      <td className="py-2">{Math.floor((item.sessionDuration || 0) / 60)} 分钟</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Empty description="暂无学习数据" className="py-10" />
        )}
      </Card>

      {/* 学习摘要 */}
      <Card title="学习摘要">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="学习会话总数" value={overview?.totalSessions || 0} suffix="次" />
          </Col>
          <Col span={12}>
            <Statistic
              title="平均掌握程度"
              value={averageMasteryLevel}
              suffix="%"
              valueStyle={{
                color:
                  averageMasteryLevel >= 80
                    ? '#3f8600'
                    : averageMasteryLevel >= 60
                      ? '#faad14'
                      : '#cf1322',
              }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
