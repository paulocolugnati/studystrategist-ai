import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Crown, Save, Settings } from 'lucide-react';

interface UserProfile {
  nome: string;
  objetivo: string;
  is_premium: boolean;
  plano: string;
}

const Perfil = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    nome: '',
    objetivo: '',
    is_premium: false,
    plano: 'free'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('nome, objetivo, is_premium, plano')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: profile.nome,
          objetivo: profile.objetivo
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado! ✅",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async () => {
    try {
      const newPremiumStatus = !profile.is_premium;
      
      const { error } = await supabase
        .from('usuarios')
        .update({ is_premium: newPremiumStatus })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, is_premium: newPremiumStatus }));
      
      toast({
        title: newPremiumStatus ? "Premium ativado! 🎉" : "Premium desativado",
        description: newPremiumStatus 
          ? "Agora você tem acesso a todos os recursos premium!" 
          : "Você voltou ao plano gratuito.",
      });
    } catch (error: any) {
      console.error('Erro ao alterar premium:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao alterar status premium",
        variant: "destructive",
      });
    }
  };

  const objetivos = [
    { value: 'medicina', label: '🩺 Medicina' },
    { value: 'engenharia', label: '⚙️ Engenharia' },
    { value: 'humanas', label: '📚 Ciências Humanas' },
    { value: 'outros', label: '🎯 Outros' }
  ];

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Perfil 👤</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações da conta. ⚙️
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profile.nome}
                  onChange={(e) => setProfile(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado.
                </p>
              </div>

              <div>
                <Label htmlFor="objetivo">Objetivo</Label>
                <Select 
                  value={profile.objetivo} 
                  onValueChange={(value) => setProfile(prev => ({ ...prev, objetivo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {objetivos.map((obj) => (
                      <SelectItem key={obj.value} value={obj.value}>
                        {obj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={updateProfile}
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Status da Conta */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Status da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Plano Atual</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.is_premium ? 'Premium 🎉' : 'Gratuito'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.is_premium 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {profile.is_premium ? 'Premium' : 'Free'}
                  </div>
                </div>

                {profile.is_premium && (
                  <div className="p-4 rounded-lg bg-primary/10 space-y-2">
                    <h4 className="font-semibold text-primary">Recursos Premium Ativos ✨</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ Chat IA ilimitado</li>
                      <li>✅ Correção de redações</li>
                      <li>✅ Simulados personalizados</li>
                      <li>✅ Planos de estudo com IA</li>
                      <li>✅ Estatísticas avançadas</li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Toggle Premium (Teste)</p>
                    <p className="text-xs text-muted-foreground">
                      Para testes de desenvolvimento
                    </p>
                  </div>
                  <Switch
                    checked={profile.is_premium}
                    onCheckedChange={togglePremium}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">Dias de sequência</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-accent">42h</div>
                    <div className="text-xs text-muted-foreground">Tempo estudado</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-secondary">78%</div>
                    <div className="text-xs text-muted-foreground">Média geral</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-green-600">51</div>
                    <div className="text-xs text-muted-foreground">Dias para ENEM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;