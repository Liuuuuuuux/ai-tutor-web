import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserId } = useUserStore();

  const onFinish = async (values: { userId: string }) => {
    setLoading(true);
    try {
      // 简化登录：直接使用 userId
      // 实际项目中应该调用后端 API 验证
      setUserId(values.userId);
      message.success('登录成功');
      navigate('/');
    } catch {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">AI Tutor</h1>
          <p className="text-gray-500">费曼学习法智能平台</p>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="userId" rules={[{ required: true, message: '请输入用户 ID' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户 ID" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-400 text-sm">
          <p>提示：输入任意用户 ID 即可登录</p>
          <p>系统会自动创建新用户</p>
        </div>
      </Card>
    </div>
  );
}
