import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import {
  BarChartOutlined,
  BookOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, user, logout } = useUserStore();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Home' },
    { key: '/learning-goals', icon: <BookOutlined />, label: 'Goals' },
    { key: '/materials', icon: <FileTextOutlined />, label: 'Materials' },
    { key: '/learning-stats', icon: <BarChartOutlined />, label: 'Stats' },
    { key: '/exam', icon: <FileDoneOutlined />, label: 'Exam' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

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
          <span className="text-lg font-medium">AI Tutor Platform</span>
          <div className="flex items-center gap-4">
            {userId ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                  <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                  <span className="text-gray-600">
                    {user?.nickname || user?.username || userId}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/login')}>
                Login
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
