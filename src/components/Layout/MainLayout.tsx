import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Layout, Menu, Space } from 'antd';
import {
  BarChartOutlined,
  BookOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  ReadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, user, logout } = useUserStore();

  const isImmersiveSession = location.pathname.startsWith('/learning-session');

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '空间首页' },
    { key: '/learning-goals', icon: <ReadOutlined />, label: '学习空间' },
    { key: '/materials', icon: <FileTextOutlined />, label: '资料' },
    { key: '/learning-stats', icon: <BarChartOutlined />, label: '统计' },
    { key: '/exam', icon: <FileDoneOutlined />, label: '测验' },
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
      label: '退出登录',
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

  const titleMap: Record<string, string> = {
    '/': '空间首页',
    '/learning-goals': '学习空间',
    '/materials': '资料中心',
    '/learning-stats': '学习统计',
    '/exam': '测验中心',
  };

  if (isImmersiveSession) {
    return (
      <Layout className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#eef4fb_100%)]">
        <Content className="relative p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#eef4fb_100%)] text-slate-900">
      <Sider
        width={272}
        className="!bg-white/90 flex flex-col border-r border-slate-200 backdrop-blur-xl"
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <BookOutlined />
          </div>
          <div>
            <div className="text-base font-semibold text-slate-900">学习空间</div>
            <div className="text-xs text-slate-400">AI Tutor Workbench</div>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Current</div>
            <div className="mt-2 text-sm font-medium text-slate-900">
              {titleMap[getSelectedKey()]}
            </div>
            <div className="mt-1 text-xs leading-6 text-slate-500">
              在这里以更像 ChatGPT 的方式持续学习、追问和复习。
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className="border-r-0 bg-transparent px-3"
        />

        <div className="mt-auto px-4 pb-4 pt-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-300">
            <div className="text-slate-400">提示</div>
            <div className="mt-2 leading-6">
              先选一个学习空间，再进入知识点聊天，整个过程会更直接。
            </div>
          </div>
        </div>
      </Sider>

      <Layout className="relative overflow-hidden bg-transparent">
        <Header className="sticky top-0 z-20 m-4 mb-0 !h-auto rounded-[28px] border border-slate-200/80 bg-white/85 px-5 py-4 leading-normal shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                Learning Space
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {titleMap[getSelectedKey()]}
              </div>
            </div>

            <Space size="middle">
              {userId ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <div className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600" />
                    <span className="text-sm text-slate-700">
                      {user?.nickname || user?.username || userId}
                    </span>
                  </div>
                </Dropdown>
              ) : (
                <Button type="primary" onClick={() => navigate('/login')}>
                  登录
                </Button>
              )}
            </Space>
          </div>
        </Header>

        <Content className="relative z-10 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
