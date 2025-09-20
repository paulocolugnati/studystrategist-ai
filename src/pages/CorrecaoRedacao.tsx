import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PremiumGuard from '@/components/PremiumGuard';
import { FileText, Send, CheckCircle, Loader2, Star } from 'lucide-react';

interface EssayResult {
  nota_total: number;
  competencias: {
    competencia_1: number;
    competencia_2: number;
    competencia_3: number;
    competencia_4: number;
    competencia_5: number;
  };
  feedback: string;
}

const CorrecaoRedacao = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayResult | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [essays, setEssays] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      loadEssayHistory();
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

  const loadEssayHistory = async () => {
    try {
      const { data } = await supabase
        .from('redacoes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setEssays(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const submitEssay = async () => {
    if (!tema.trim() || !texto.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o tema e o texto da redação.",
        variant: "destructive",
      });
      return;
    }

    if (texto.length < 100) {
      toast({
        title: "Texto muito curto",
        description: "A redação deve ter pelo menos 100 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('corrigir-redacao', {
        body: {
          tema: tema.trim(),
          texto: texto.trim(),
          userId: user?.id
        }
      });

      if (error) throw error;

      setResult(data);
      setTema('');
      setTexto('');
      loadEssayHistory(); // Reload history

      toast({
        title: "Redação corrigida! ✅",
        description: `Nota: ${data.nota_total}/1000 pontos`,
      });
    } catch (error: any) {
      console.error('Erro na correção:', error);
      toast({
        title: "Erro na correção",
        description: error.message || "Falha ao corrigir redação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const competenciaLabels = {
    competencia_1: "Domínio da norma culta",
    competencia_2: "Compreender a proposta",
    competencia_3: "Argumentação",
    competencia_4: "Coesão textual",
    competencia_5: "Proposta de intervenção"
  };

  if (!isPremium) {
    return <PremiumGuard isPremium={isPremium} featureName="Correção de Redação" children={null} />;
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Correção de Redação ✍️</h1>
          <p className="text-muted-foreground">
            Envie sua redação e receba uma correção detalhada baseada nos critérios do ENEM. 📝
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Redação */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Nova Redação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tema">Tema da Redação</Label>
                  <Input
                    id="tema"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ex: Os desafios da sustentabilidade no Brasil"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="texto">Texto da Redação</Label>
                  <Textarea
                    id="texto"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escreva sua redação aqui... (mínimo 100 caracteres)"
                    rows={12}
                    disabled={loading}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {texto.length} caracteres
                  </p>
                </div>

                <Button 
                  onClick={submitEssay}
                  disabled={loading || !tema.trim() || !texto.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Corrigindo...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Corrigir Redação
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Redações Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                {essays.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma redação enviada ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {essays.map((essay) => (
                      <div key={essay.id} className="p-3 rounded-lg bg-muted/30 space-y-1">
                        <p className="font-medium truncate">{essay.tema}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(essay.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {essay.nota}/1000
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resultado da Correção */}
          <div>
            {result ? (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Resultado da Correção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nota Total */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {result.nota_total}
                    </div>
                    <p className="text-muted-foreground">pontos de 1000</p>
                    <Progress 
                      value={(result.nota_total / 1000) * 100} 
                      className="mt-3"
                    />
                  </div>

                  {/* Competências */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Detalhamento por Competência</h3>
                    {Object.entries(result.competencias).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            {competenciaLabels[key as keyof typeof competenciaLabels]}
                          </span>
                          <span className="text-sm font-semibold">{value}/200</span>
                        </div>
                        <Progress value={(value / 200) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Feedback Detalhado</h3>
                    <div className="p-4 rounded-lg bg-muted/30 text-sm">
                      {result.feedback}
                    </div>
                  </div>

                  {/* Nível */}
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">
                      {result.nota_total >= 800 ? 'Excelente!' : 
                       result.nota_total >= 600 ? 'Muito Bom!' : 
                       result.nota_total >= 400 ? 'Bom!' : 'Continue praticando!'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-shadow">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Envie sua redação para ver o resultado da correção aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrecaoRedacao;