import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Target, Clock, Calendar, Award } from 'lucide-react';

// Simple chart components since recharts is having issues
const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => (
  <div className="space-y-4">
    <h3 className="font-semibold">{title}</h3>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm">{item.name}</span>
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">{item.value}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimpleLineChart = ({ data, title }: { data: any[], title: string }) => (
  <div className="space-y-4">
    <h3 className="font-semibold">{title}</h3>
    <div className="grid grid-cols-7 gap-1 h-32 items-end">
      {data.slice(0, 7).map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div 
            className="bg-primary rounded-t w-full min-h-[4px] transition-all duration-300"
            style={{ height: `${Math.max(4, (item.value / 100) * 100)}%` }}
          />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const Estatisticas = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState({
    simulados: [],
    redacoes: [],
    progressoSemanal: [],
    materiasPerformance: [],
    tempoEstudo: 0,
    sequenciaDias: 0,
    mediaGeral: 0,
    totalSimulados: 0,
    totalRedacoes: 0
  });

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user, period]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSimuladosStats(),
        loadRedacoesStats(),
        loadProgressoStats(),
        loadOverviewStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimuladosStats = async () => {
    try {
      const { data } = await supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setStats(prev => ({ ...prev, simulados: data, totalSimulados: data.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar simulados:', error);
    }
  };

  const loadRedacoesStats = async () => {
    try {
      const { data } = await supabase
        .from('redacoes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setStats(prev => ({ ...prev, redacoes: data, totalRedacoes: data.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar redações:', error);
    }
  };

  const loadProgressoStats = async () => {
    try {
      const { data } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user?.id)
        .order('data_atividade', { ascending: false })
        .limit(30);

      if (data) {
        // Group by materia for performance chart
        const materiasMap = data.reduce((acc: any, item) => {
          if (!acc[item.materia]) {
            acc[item.materia] = [];
          }
          acc[item.materia].push(item.acertos_percent || 0);
          return acc;
        }, {});

        const materiasPerformance = Object.entries(materiasMap).map(([name, values]: [string, any]) => ({
          name,
          value: Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
        }));

        // Last 7 days progress
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toLocaleDateString('pt-BR', { weekday: 'short' });
        }).reverse();

        const progressoSemanal = last7Days.map((day, index) => ({
          name: day,
          value: Math.floor(Math.random() * 40) + 60 // Mock data
        }));

        setStats(prev => ({ 
          ...prev, 
          materiasPerformance: materiasPerformance.slice(0, 6),
          progressoSemanal
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const loadOverviewStats = async () => {
    // Mock some overview stats
    setStats(prev => ({
      ...prev,
      tempoEstudo: 42, // hours
      sequenciaDias: 7,
      mediaGeral: 78
    }));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Estatísticas 📊</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e performance nos estudos! 📈
            </p>
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Última semana</SelectItem>
              <SelectItem value="30d">Último mês</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência de Estudos</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sequenciaDias} dias</div>
              <p className="text-xs text-green-600">Parabéns! Continue assim! 🔥</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Estudo</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tempoEstudo}h</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mediaGeral}%</div>
              <p className="text-xs text-purple-600">+5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <Award className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSimulados + stats.totalRedacoes}</div>
              <p className="text-xs text-muted-foreground">Simulados + Redações</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progresso Semanal */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progresso Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleLineChart data={stats.progressoSemanal} title="" />
            </CardContent>
          </Card>

          {/* Performance por Matéria */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance por Matéria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.materiasPerformance} title="" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Histórico de Simulados */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Últimos Simulados</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.simulados.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum simulado realizado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.simulados.slice(0, 5).map((sim: any) => (
                    <div key={sim.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{sim.tipo || 'Geral'}</p>
                        <p className="text-sm text-muted-foreground">
                          {sim.acertos}/{sim.questoes_count} acertos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{sim.acertos_percent}%</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Redações */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Últimas Redações</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.redacoes.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma redação corrigida ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.redacoes.slice(0, 5).map((red: any) => (
                    <div key={red.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium truncate max-w-[150px]">{red.tema}</p>
                        <p className="text-sm text-muted-foreground">
                          Redação ENEM
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-accent">{red.nota}/1000</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(red.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;