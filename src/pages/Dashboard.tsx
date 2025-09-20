import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  FileText, 
  BarChart3, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  nome: string;
  objetivo: string;
  plano: string;
}

interface ProgressData {
  sequencia_dias: number;
  meta_semanal_atual: number;
  meta_semanal_total: number;
  tempo_total: number;
  media_geral: number;
  progresso_semanal: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressData>({
    sequencia_dias: 7,
    meta_semanal_atual: 18,
    meta_semanal_total: 29,
    tempo_total: 156,
    media_geral: 78,
    progresso_semanal: 5
  });

  // Calcular dias até o ENEM
  const enemDate = new Date('2025-11-09');
  const hoje = new Date();
  const diasAteEnem = Math.ceil((enemDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadProgressData();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('nome, objetivo, plano')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadProgressData = async () => {
    // Implementar carregamento real dos dados de progresso
    // Por enquanto, usando dados mock
  };

  const acaoRapida = [
    {
      icon: MessageCircle,
      title: 'Chat IA',
      description: 'Tire suas dúvidas com IA',
      path: '/chat-ia',
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'Corrigir Redação',
      description: 'Corrija sua redação com IA',
      path: '/correcao-redacao',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Fazer Simulado',
      description: 'Pratique com questões',
      path: '/simulados',
      color: 'bg-purple-500'
    },
    {
      icon: Target,
      title: 'Plano de Estudos',
      description: 'Organize seus estudos',
      path: '/plano-estudos',
      color: 'bg-orange-500'
    }
  ];

  const atividadesRecentes = [
    { materia: 'Matemática', tempo: '2h', resultado: '92%', quando: 'hoje' },
    { materia: 'Redação', tempo: '1h', resultado: '85pts', quando: 'ontem' },
    { materia: 'História', tempo: '1h30', resultado: '92%', quando: 'ontem' },
    { materia: 'Química', tempo: '1h30', resultado: '88%', quando: '2 dias atrás' }
  ];

  const proximasTarefas = [
    { tarefa: 'Revisar Funções Quadráticas', materia: 'Matemática', quando: 'hoje 16:00' },
    { tarefa: 'Simulado História', materia: 'História', quando: 'amanhã 14:00' },
    { tarefa: 'Redação meio ambiente', materia: 'Redação', quando: 'amanhã 20:00' }
  ];

  return (
    <div className="container py-8">
      {/* Header com saudação */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Olá, {profile?.nome || 'Estudante'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Você está a <span className="font-semibold text-accent">{diasAteEnem} dias</span> do ENEM 2025. Vamos estudar! 🎯
        </p>
      </div>

      {/* Cards de Progresso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência 7 dias</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.sequencia_dias} dias</div>
            <Progress value={100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Meta alcançada!</p>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.meta_semanal_atual}/{progress.meta_semanal_total}h</div>
            <Progress value={(progress.meta_semanal_atual / progress.meta_semanal_total) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">62% da meta</p>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.tempo_total}h</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">78% do objetivo</p>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.media_geral}%</div>
            <Progress value={progress.media_geral} className="mt-2" />
            <p className="text-xs text-green-600 mt-2">+{progress.progresso_semanal}% esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {acaoRapida.map((acao, index) => {
            const Icon = acao.icon;
            return (
              <Card 
                key={index} 
                className="card-shadow hover:card-shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(acao.path)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${acao.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{acao.title}</h3>
                  <p className="text-sm text-muted-foreground">{acao.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividades Recentes */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atividadesRecentes.map((atividade, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{atividade.materia}</p>
                    <p className="text-sm text-muted-foreground">{atividade.tempo} • {atividade.quando}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{atividade.resultado}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximas Tarefas */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasTarefas.map((tarefa, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{tarefa.tarefa}</p>
                    <p className="text-sm text-muted-foreground">{tarefa.materia} • {tarefa.quando}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/plano-estudos')}
            >
              Ver Plano Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;