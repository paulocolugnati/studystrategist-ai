import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, X, Zap, Star } from 'lucide-react';

const Premium = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('is_premium')
        .eq('user_id', user?.id)
        .single();
      
      setIsPremium(data?.is_premium || false);
    } catch (error) {
      console.error('Erro ao verificar status premium:', error);
    }
  };

  const activatePremium = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ is_premium: true })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsPremium(true);
      toast({
        title: "Premium ativado! 🎉",
        description: "Agora você tem acesso a todos os recursos premium!",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao ativar premium:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao ativar premium",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      name: 'Chat IA',
      free: '❌ Limitado',
      premium: '✅ Ilimitado',
      description: 'Converse com IA especialista em ENEM sem limites'
    },
    {
      name: 'Correção de Redação',
      free: '❌ Não disponível',
      premium: '✅ Ilimitado',
      description: 'Corrija suas redações com feedback detalhado'
    },
    {
      name: 'Simulados',
      free: '❌ Não disponível',
      premium: '✅ Acesso total',
      description: 'Simulados personalizados por matéria'
    },
    {
      name: 'Plano de Estudos',
      free: '❌ Não disponível',
      premium: '✅ Com IA',
      description: 'Planos personalizados gerados por IA'
    },
    {
      name: 'Biblioteca',
      free: '✅ Básico',
      premium: '✅ Completo',
      description: 'Acesso a todos os materiais de estudo'
    },
    {
      name: 'Estatísticas',
      free: '✅ Básico',
      premium: '✅ Avançado',
      description: 'Análises detalhadas do seu progresso'
    }
  ];

  if (isPremium) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="card-shadow">
            <CardHeader className="pb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-2">Você já é Premium! 🎉</CardTitle>
              <p className="text-muted-foreground">
                Aproveite todos os recursos premium da EstratégiaENEM
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">IA Ilimitada</h3>
                  <p className="text-sm text-muted-foreground">Chat e correções sem limite</p>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/10 text-center">
                  <Star className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold">Recursos Exclusivos</h3>
                  <p className="text-sm text-muted-foreground">Simulados e planos personalizados</p>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/10 text-center">
                  <Check className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <h3 className="font-semibold">Suporte Premium</h3>
                  <p className="text-sm text-muted-foreground">Atendimento prioritário</p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full max-w-sm mx-auto"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upgrade para Premium 👑
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Desbloqueie todo o potencial da EstratégiaENEM
          </p>
          <p className="text-muted-foreground">
            Acesso completo a IA, simulados, correção de redação e muito mais!
          </p>
        </div>

        {/* Comparação de Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plano Gratuito */}
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Plano Gratuito</CardTitle>
                <Badge variant="outline">Atual</Badge>
              </div>
              <div className="text-3xl font-bold">R$ 0</div>
              <p className="text-muted-foreground">Por mês</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Acesso à biblioteca básica</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Estatísticas básicas</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Chat IA limitado</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Sem correção de redação</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Sem simulados</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Sem planos de estudo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="card-shadow ring-2 ring-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Recomendado
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  Premium
                  <Crown className="h-5 w-5 text-primary" />
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground">Melhor Valor</Badge>
              </div>
              <div className="text-3xl font-bold">R$ 29,90</div>
              <p className="text-muted-foreground">Por mês</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Tudo do plano gratuito</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Chat IA ilimitado 🤖</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Correção de redação com IA ✍️</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Simulados personalizados 🎯</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Planos de estudo com IA 📚</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Estatísticas avançadas 📊</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Suporte prioritário 🚀</span>
                </li>
              </ul>

              <Button 
                onClick={activatePremium}
                disabled={loading}
                className="w-full mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ativando...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Ativar Premium Agora
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2">
                * Para fins de demonstração, o premium é ativado instantaneamente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparação Detalhada */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Comparação Detalhada de Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Recurso</th>
                    <th className="text-center py-3 px-4">Gratuito</th>
                    <th className="text-center py-3 px-4">Premium</th>
                    <th className="text-left py-3 px-4">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-4 font-medium">{feature.name}</td>
                      <td className="py-3 px-4 text-center">{feature.free}</td>
                      <td className="py-3 px-4 text-center">{feature.premium}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{feature.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;