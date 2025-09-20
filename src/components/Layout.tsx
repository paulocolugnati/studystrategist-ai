import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Target, 
  Book, 
  User, 
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'Chat IA', path: '/chat-ia' },
    { icon: FileText, label: 'Redação', path: '/correcao-redacao' },
    { icon: Target, label: 'Simulados', path: '/simulados' },
    { icon: BookOpen, label: 'Plano de Estudos', path: '/plano-estudos' },
    { icon: Book, label: 'Biblioteca', path: '/biblioteca' },
    { icon: BarChart3, label: 'Estatísticas', path: '/estatisticas' },
    { icon: User, label: 'Perfil', path: '/perfil' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">EstratégiaENEM</span>
          </Link>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-accent/10 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-sm text-foreground mb-2">Upgrade para Premium</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Acesso ilimitado a todas as funcionalidades
            </p>
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/premium')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Assinar Premium
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm text-foreground truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;