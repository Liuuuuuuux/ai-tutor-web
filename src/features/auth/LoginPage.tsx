import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores';
import { login } from '@/api';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const onFinish = async (values: { username: string }) => {
    setLoading(true);
    try {
      // 调用后端登录 API
      const response = await login({ username: values.username });

      // 设置用户信息到全局状态
      setUser(response.user);

      if (response.isNewUser) {
        message.success('欢迎新用户！已为您自动创建账号');
      } else {
        message.success('登录成功');
      }

      navigate('/');
    } catch (error) {
      message.error('登录失败，请重试');
      console.error('登录错误:', error);
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
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少 2 个字符' },
              { max: 32, message: '用户名最多 32 个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-400 text-sm">
          <p>提示：输入用户名即可登录</p>
          <p>新用户会自动创建账号</p>
        </div>
      </Card>
    </div>
  );
}
