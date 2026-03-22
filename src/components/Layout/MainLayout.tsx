import { Outlet } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, logout } = useUserStore();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/learning-goals',
      icon: <BookOutlined />,
      label: '学习目标',
    },
    {
      key: '/materials',
      icon: <FileTextOutlined />,
      label: '学习资料',
    },
    {
      key: '/learning-stats',
      icon: <BarChartOutlined />,
      label: '学习统计',
    },
    {
      key: '/exam',
      icon: <FileDoneOutlined />,
      label: '试卷生成',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/learning-goals')) return '/learning-goals';
    if (path.startsWith('/knowledge-points')) return '/learning-goals';
    if (path.startsWith('/learning-session')) return '/learning-goals';
    if (path.startsWith('/materials')) return '/materials';
    if (path.startsWith('/learning-stats')) return '/learning-stats';
    if (path.startsWith('/exam')) return '/exam';
    return '/';
  };

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-md" breakpoint="lg" collapsedWidth="0">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">AI Tutor</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <span className="text-lg font-medium">费曼学习法智能平台</span>
          <div className="flex items-center gap-4">
            {userId ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                  <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                  <span className="text-gray-600">{userId}</span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
        </Header>
        <Content className="m-4 md:m-6 p-4 md:p-6 bg-white rounded-lg shadow-sm overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
