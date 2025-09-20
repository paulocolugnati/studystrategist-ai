import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PremiumGuard from '@/components/PremiumGuard';
import { generateStudyPlan } from '@/lib/hf';
import { BookOpen, Target, Calendar, Loader2, CheckCircle } from 'lucide-react';

const PlanoEstudos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusArea, setFocusArea] = useState('');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      loadStudyPlans();
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

  const loadStudyPlans = async () => {
    try {
      const { data } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPlans(data);
        if (data.length > 0) {
          setCurrentPlan(data[0].plan_content);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const generatePlan = async () => {
    if (!focusArea) {
      toast({
        title: "Área obrigatória",
        description: "Selecione uma área de foco para gerar o plano.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const plan = await generateStudyPlan(focusArea, user?.id || '');
      setCurrentPlan(plan);

      // Save to database
      const { error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user?.id,
          focus_area: focusArea,
          plan_content: plan
        });

      if (error) {
        console.error('Erro ao salvar plano:', error);
      } else {
        loadStudyPlans();
        toast({
          title: "Plano gerado! 🎯",
          description: "Seu plano de estudos personalizado foi criado.",
        });
      }
    } catch (error: any) {
      console.error('Erro na geração do plano:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Falha ao gerar plano de estudos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const focusOptions = [
    { value: 'medicina', label: '🩺 Medicina', description: 'Foco em Ciências da Natureza' },
    { value: 'engenharia', label: '⚙️ Engenharia', description: 'Foco em Matemática e Física' },
    { value: 'humanas', label: '📚 Ciências Humanas', description: 'História, Geografia, Filosofia' },
    { value: 'outros', label: '🎯 Preparação Geral', description: 'Todas as áreas equilibradas' }
  ];

  if (!isPremium) {
    return <PremiumGuard isPremium={isPremium} featureName="Plano de Estudos" children={null} />;
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Plano de Estudos 📚</h1>
          <p className="text-muted-foreground">
            Gere um plano personalizado com IA baseado no seu objetivo! 🎯
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gerador de Plano */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Gerar Novo Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="focus">Área de Foco</Label>
                  <Select onValueChange={setFocusArea} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {focusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generatePlan}
                  disabled={loading || !focusArea}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando plano...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Gerar Plano com IA
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Plano personalizado com IA</p>
                  <p>• Cronograma semanal detalhado</p>
                  <p>• Metas e objetivos claros</p>
                  <p>• Baseado no seu objetivo</p>
                </div>
              </CardContent>
            </Card>

            {/* Planos Anteriores */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Planos Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nenhum plano criado ainda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className="p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setCurrentPlan(plan.plan_content)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{plan.focus_area}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plano Atual */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Seu Plano de Estudos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {currentPlan}
                    </pre>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <div className="text-lg font-bold text-primary">7 dias</div>
                        <div className="text-sm text-muted-foreground">por semana</div>
                      </div>
                      <div className="p-3 rounded-lg bg-accent/10">
                        <div className="text-lg font-bold text-accent">20h+</div>
                        <div className="text-sm text-muted-foreground">de estudos</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Gere seu primeiro plano de estudos personalizado!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecione uma área de foco e clique em "Gerar Plano"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanoEstudos;