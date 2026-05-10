import { useState } from 'react';
import { Button, Card, Form, Input, Tabs, message } from 'antd';
import { LockOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores';
import { checkUsernameAvailable, login, register } from '@/api';

type AuthMode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setSession } = useUserStore();

  const onFinish = async (values: { username: string; password: string; nickname?: string }) => {
    setLoading(true);
    try {
      if (mode === 'register') {
        const available = await checkUsernameAvailable(values.username);
        if (!available) {
          message.error('Username already exists');
          return;
        }
      }

      const session =
        mode === 'login'
          ? await login({ username: values.username, password: values.password })
          : await register({
              username: values.username,
              nickname: values.nickname || values.username,
              password: values.password,
            });

      setSession(session);
      message.success(mode === 'login' ? 'Login success' : 'Register success');
      navigate('/');
    } catch (error) {
      message.error(mode === 'login' ? 'Login failed' : 'Register failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#dbeafe_40%,_#bfdbfe_100%)] px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">AI Tutor</h1>
          <p className="text-slate-500 mt-2">MVP auth</p>
        </div>

        <Tabs
          activeKey={mode}
          onChange={(key) => {
            setMode(key as AuthMode);
            form.resetFields();
          }}
          centered
          items={[
            { key: 'login', label: 'Login' },
            { key: 'register', label: 'Register' },
          ]}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter username' },
              { min: 2, message: 'At least 2 characters' },
              { max: 32, message: 'At most 32 characters' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          {mode === 'register' ? (
            <Form.Item
              name="nickname"
              label="Nickname"
              rules={[{ required: true, message: 'Please enter nickname' }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Nickname" />
            </Form.Item>
          ) : null}

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 4, message: 'At least 4 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {mode === 'register' ? (
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>
          ) : null}

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              {mode === 'login' ? 'Login' : 'Register'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
