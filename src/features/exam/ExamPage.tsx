import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Space,
  List,
  Tag,
  Modal,
  Spin,
  Empty,
  message,
  Checkbox,
  Divider,
} from 'antd';
import { FileTextOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/exam';
import type { ExamPaper, Question } from '@/types';

const questionTypeConfig: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  judgment: '判断题',
  fill_in_the_blank: '填空题',
  short_answer: '简答题',
  completion: '综合题',
  SINGLE_CHOICE: '单选题',
  MULTIPLE_CHOICE: '多选题',
  TRUE_FALSE: '判断题',
  SHORT_ANSWER: '简答题',
};

export function ExamPage() {
  const [searchParams] = useSearchParams();
  const goalIdParam = searchParams.get('goalId');

  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewExam, setPreviewExam] = useState<ExamPaper | null>(null);

  const queryClient = useQueryClient();

  // 获取试卷列表
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.getExams(),
  });

  // 生成试卷
  const generateMutation = useMutation({
    mutationFn: api.generateExam,
    onSuccess: () => {
      message.success('试卷生成请求已提交');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: () => {
      message.error('试卷生成失败');
    },
  });

  // 初始化表单默认值
  useEffect(() => {
    if (goalIdParam) {
      form.setFieldsValue({ goalId: goalIdParam });
    }
  }, [goalIdParam, form]);

  // 生成试卷
  const handleGenerate = async () => {
    const values = await form.validateFields();

    // 构建符合后端期望的请求格式
    const config: Record<string, { difficulty: string; count: number }> = {};
    const requiredTypes: string[] = values.questionTypes || [];

    const totalCount = values.questionCount || 10;
    requiredTypes.forEach((type, index) => {
      // 最后一个题型使用剩余数量，避免舍入误差
      const isLast = index === requiredTypes.length - 1;
      const count = isLast
        ? totalCount -
          requiredTypes.slice(0, -1).length * Math.floor(totalCount / requiredTypes.length)
        : Math.floor(totalCount / requiredTypes.length);
      config[type] = {
        difficulty: values.difficulty || 'MEDIUM',
        count,
      };
    });

    generateMutation.mutate({
      examConfig: {
        examTitle: values.title || 'AI生成试卷',
        requiredTypes,
        config,
      },
    });
  };

  // 预览试卷
  const handlePreview = async (exam: ExamPaper) => {
    if (exam.status === 1) {
      // 获取完整试卷详情
      const detail = await api.getExamDetail(exam.id);
      setPreviewExam(detail);
      setPreviewVisible(true);
    } else {
      message.info('试卷正在生成中，请稍后刷新');
    }
  };

  // 渲染题目
  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id || index} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <span className="font-bold">{index + 1}.</span>
          <div>
            <Tag color="blue">{questionTypeConfig[question.type] || question.type}</Tag>
            <span className="ml-2">{question.question}</span>
            <span className="text-gray-400 ml-2">({question.score}分)</span>
          </div>
        </div>

        {/* 选项 */}
        {question.options && question.options.length > 0 && (
          <div className="ml-6 space-y-2">
            {question.options.map((option, i) => {
              const isCorrect = option.optionKey === question.answer;
              return (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    isCorrect ? 'bg-green-100 border border-green-300' : 'bg-white'
                  }`}
                >
                  <span className="font-medium mr-2">{option.optionKey}.</span>
                  {option.content}
                  {isCorrect && <CheckCircleOutlined className="text-green-500 ml-2" />}
                </div>
              );
            })}
          </div>
        )}

        {/* 答案和解析 */}
        <div className="ml-6 mt-3">
          <div className="text-green-600">
            <strong>答案：</strong>
            {question.type === 'short_answer' || question.type === 'SHORT_ANSWER' ? (
              <div className="whitespace-pre-wrap mt-1">{question.answer}</div>
            ) : (
              question.answer
            )}
          </div>
          {question.analysis && (
            <div className="text-gray-600 mt-2">
              <strong>解析：</strong>
              {question.analysis}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 获取状态配置
  const getStatusConfig = (status: number) => {
    return api.examStatusMap[status] || { key: 'UNKNOWN', text: '未知', color: 'default' };
  };

  return (
    <div className="space-y-6">
      {/* 生成试卷表单 */}
      <Card title="生成试卷">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            questionCount: 10,
            difficulty: 'MEDIUM',
            questionTypes: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'],
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="title" label="试卷标题">
              <Select
                placeholder="可选，不填则自动生成"
                allowClear
                options={[
                  { label: '单元测试', value: '单元测试' },
                  { label: '期中测试', value: '期中测试' },
                  { label: '期末测试', value: '期末测试' },
                  { label: '综合测试', value: '综合测试' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="questionCount"
              label="题目数量"
              rules={[{ required: true, message: '请输入题目数量' }]}
            >
              <InputNumber min={5} max={50} className="w-full" />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="难度"
              rules={[{ required: true, message: '请选择难度' }]}
            >
              <Select
                options={[
                  { label: '简单', value: 'EASY' },
                  { label: '中等', value: 'MEDIUM' },
                  { label: '困难', value: 'HARD' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="questionTypes"
              label="题型"
              rules={[{ required: true, message: '请选择题型' }]}
            >
              <Checkbox.Group
                options={[
                  { label: '单选题', value: 'SINGLE_CHOICE' },
                  { label: '多选题', value: 'MULTIPLE_CHOICE' },
                  { label: '判断题', value: 'TRUE_FALSE' },
                  { label: '简答题', value: 'SHORT_ANSWER' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0">
            <Button type="primary" onClick={handleGenerate} loading={generateMutation.isPending}>
              生成试卷
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 试卷列表 */}
      <Card title="我的试卷">
        {examsLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : examsData && examsData.length > 0 ? (
          <List
            dataSource={examsData}
            renderItem={(exam: ExamPaper) => {
              const statusCfg = getStatusConfig(exam.status);
              return (
                <List.Item
                  actions={[
                    <Button
                      key="preview"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(exam)}
                      disabled={exam.status !== 1}
                    >
                      预览
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined className="text-2xl text-blue-500" />}
                    title={
                      <Space>
                        <span>{exam.examTitle || '未命名试卷'}</span>
                        <Tag color={statusCfg.color}>{statusCfg.text}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<Divider type="vertical" />}>
                        <span>{exam.questionCount || 0} 道题</span>
                        <span>总分 {exam.totalScore || 0} 分</span>
                        <span>时长 {exam.duration || 60} 分钟</span>
                        {exam.createTime && (
                          <span>{new Date(exam.createTime).toLocaleString()}</span>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="暂无试卷，请先生成试卷" />
        )}
      </Card>

      {/* 试卷预览弹窗 */}
      <Modal
        title={previewExam?.examTitle || '试卷预览'}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewExam && (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">{previewExam.examTitle}</h2>
              <Space className="mt-2">
                <span>共 {previewExam.questions?.length || 0} 题</span>
                <span>总分 {previewExam.totalScore || 0} 分</span>
                <span>时长 {previewExam.duration || 60} 分钟</span>
              </Space>
            </div>
            <Divider />
            {previewExam.questions?.map((q, i) => renderQuestion(q, i))}
          </div>
        )}
      </Modal>
    </div>
  );
}
