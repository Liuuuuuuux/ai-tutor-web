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
import {
  FileTextOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLearningGoals } from '@/hooks';
import * as api from '@/api/exam';
import type { ExamPaper, ExamQuestion } from '@/api/exam';

const difficultyConfig = {
  EASY: { color: 'green', text: '简单' },
  MEDIUM: { color: 'orange', text: '中等' },
  HARD: { color: 'red', text: '困难' },
};

const questionTypeConfig = {
  SINGLE_CHOICE: '单选题',
  MULTIPLE_CHOICE: '多选题',
  TRUE_FALSE: '判断题',
  SHORT_ANSWER: '简答题',
};

const statusConfig = {
  GENERATING: { color: 'processing', text: '生成中' },
  COMPLETED: { color: 'success', text: '已完成' },
  FAILED: { color: 'error', text: '生成失败' },
};

export function ExamPage() {
  const [searchParams] = useSearchParams();
  const goalIdParam = searchParams.get('goalId');

  const [form] = Form.useForm();
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goalIdParam || '');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewExam, setPreviewExam] = useState<ExamPaper | null>(null);

  const queryClient = useQueryClient();

  // 获取学习目标列表
  const { data: goalsData } = useLearningGoals();

  // 获取试卷列表
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exams', selectedGoalId],
    queryFn: () => api.getExams(selectedGoalId || undefined),
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

  // 删除试卷
  const deleteMutation = useMutation({
    mutationFn: api.deleteExam,
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
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
    generateMutation.mutate({
      goalId: values.goalId,
      title: values.title,
      questionCount: values.questionCount,
      difficulty: values.difficulty,
      questionTypes: values.questionTypes,
    });
  };

  // 预览试卷
  const handlePreview = async (exam: ExamPaper) => {
    if (exam.status === 'COMPLETED') {
      setPreviewExam(exam);
      setPreviewVisible(true);
    } else {
      message.info('试卷正在生成中，请稍后刷新');
    }
  };

  // 渲染题目
  const renderQuestion = (question: ExamQuestion, index: number) => {
    const isCorrect = (answer: string) => answer === question.answer;

    return (
      <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <span className="font-bold">{index + 1}.</span>
          <div>
            <Tag color="blue">{questionTypeConfig[question.type]}</Tag>
            <span className="ml-2">{question.content}</span>
            <span className="text-gray-400 ml-2">({question.score}分)</span>
          </div>
        </div>

        {/* 选项 */}
        {question.options && question.options.length > 0 && (
          <div className="ml-6 space-y-2">
            {question.options.map((option, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  isCorrect(String.fromCharCode(65 + i))
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-white'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
                {isCorrect(String.fromCharCode(65 + i)) && (
                  <CheckCircleOutlined className="text-green-500 ml-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 答案和解析 */}
        <div className="ml-6 mt-3">
          <div className="text-green-600">
            <strong>答案：</strong>
            {question.type === 'SHORT_ANSWER' ? (
              <div className="whitespace-pre-wrap mt-1">{question.answer}</div>
            ) : (
              question.answer
            )}
          </div>
          {question.explanation && (
            <div className="text-gray-600 mt-2">
              <strong>解析：</strong>
              {question.explanation}
            </div>
          )}
        </div>
      </div>
    );
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
            <Form.Item
              name="goalId"
              label="学习目标"
              rules={[{ required: true, message: '请选择学习目标' }]}
            >
              <Select
                placeholder="请选择学习目标"
                onChange={setSelectedGoalId}
                options={goalsData?.records?.map((g) => ({
                  label: g.title,
                  value: g.id,
                }))}
              />
            </Form.Item>

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
              className="md:col-span-2"
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
        ) : (examsData?.records?.length ?? 0) > 0 ? (
          <List
            dataSource={examsData?.records || []}
            renderItem={(exam: ExamPaper) => (
              <List.Item
                actions={[
                  <Button
                    key="preview"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(exam)}
                    disabled={exam.status !== 'COMPLETED'}
                  >
                    预览
                  </Button>,
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: '确定要删除这份试卷吗？',
                        onOk: () => deleteMutation.mutate(exam.id),
                      });
                    }}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined className="text-2xl text-blue-500" />}
                  title={
                    <Space>
                      <span>{exam.title || '未命名试卷'}</span>
                      <Tag color={statusConfig[exam.status]?.color}>
                        {statusConfig[exam.status]?.text}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space split={<Divider type="vertical" />}>
                      <span>{exam.questionCount} 道题</span>
                      <Tag color={difficultyConfig[exam.difficulty]?.color}>
                        {difficultyConfig[exam.difficulty]?.text}
                      </Tag>
                      <span>{new Date(exam.createdAt).toLocaleString()}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无试卷，请先生成试卷" />
        )}
      </Card>

      {/* 试卷预览弹窗 */}
      <Modal
        title={previewExam?.title || '试卷预览'}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewExam && (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">{previewExam.title}</h2>
              <Space className="mt-2">
                <Tag color={difficultyConfig[previewExam.difficulty]?.color}>
                  {difficultyConfig[previewExam.difficulty]?.text}
                </Tag>
                <span>共 {previewExam.questions?.length || 0} 题</span>
                <span>
                  总分 {previewExam.questions?.reduce((sum, q) => sum + q.score, 0) || 0} 分
                </span>
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
