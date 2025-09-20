import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PremiumGuard from '@/components/PremiumGuard';
import { Target, Clock, CheckCircle, X, Play, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  enunciado: string;
  alternativas: string[];
  resposta_correta: string;
  materia: string;
  dificuldade: number;
}

interface SimuladoSession {
  questions: Question[];
  currentQuestion: number;
  answers: Record<string, string>;
  startTime: Date;
  timeElapsed: number;
}

const Simulados = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SimuladoSession | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      loadSimuladoHistory();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session && !showResult) {
      interval = setInterval(() => {
        setSession(prev => prev ? {
          ...prev,
          timeElapsed: Date.now() - prev.startTime.getTime()
        } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session, showResult]);

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

  const loadSimuladoHistory = async () => {
    try {
      const { data } = await supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const startSimulado = async (materia?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('questoes')
        .select('*')
        .limit(10);

      if (materia && materia !== 'todas') {
        query = query.eq('materia', materia);
      }

      const { data: questions } = await query;

      if (!questions || questions.length === 0) {
        toast({
          title: "Sem questões",
          description: "Não há questões disponíveis para esta matéria.",
          variant: "destructive",
        });
        return;
      }

      // Convert and shuffle questions
      const convertedQuestions: Question[] = questions.map(q => ({
        ...q,
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : JSON.parse(q.alternativas as string)
      }));
      const shuffled = convertedQuestions.sort(() => Math.random() - 0.5);
      
      setSession({
        questions: shuffled,
        currentQuestion: 0,
        answers: {},
        startTime: new Date(),
        timeElapsed: 0
      });
      setShowResult(false);
    } catch (error) {
      console.error('Erro ao iniciar simulado:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar questões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, answer: string) => {
    if (!session) return;
    
    setSession(prev => prev ? {
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    } : null);
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestion < session.questions.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      } : null);
    } else {
      finishSimulado();
    }
  };

  const finishSimulado = async () => {
    if (!session) return;

    const correctAnswers = session.questions.filter(q => 
      session.answers[q.id] === q.resposta_correta
    ).length;
    
    const finalScore = Math.round((correctAnswers / session.questions.length) * 100);
    setScore(finalScore);
    setShowResult(true);

    // Save to database
    try {
      const { error } = await supabase
        .from('simulados')
        .insert({
          user_id: user?.id,
          tipo: 'geral',
          questoes_count: session.questions.length,
          acertos: correctAnswers,
          acertos_percent: finalScore,
          tempo_gasto: Math.round(session.timeElapsed / 1000 / 60) // minutes
        });

      if (error) console.error('Erro ao salvar simulado:', error);
      else loadSimuladoHistory();
    } catch (error) {
      console.error('Erro ao salvar simulado:', error);
    }
  };

  const resetSimulado = () => {
    setSession(null);
    setShowResult(false);
    setScore(0);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isPremium) {
    return <PremiumGuard isPremium={isPremium} featureName="Simulados" children={null} />;
  }

  if (showResult && session) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="card-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Resultado do Simulado 🎯</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-muted-foreground">
                  {Object.keys(session.answers).length} de {session.questions.length} questões respondidas
                </p>
                <p className="text-sm text-muted-foreground">
                  Tempo: {formatTime(session.timeElapsed)}
                </p>
              </div>

              <Progress value={score} className="h-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {session.questions.filter(q => session.answers[q.id] === q.resposta_correta).length} Acertos
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {session.questions.filter(q => session.answers[q.id] && session.answers[q.id] !== q.resposta_correta).length} Erros
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                  <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-400">
                    {session.questions.length - Object.keys(session.answers).length} Não respondidas
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={resetSimulado} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Novo Simulado
                </Button>
                <Button onClick={() => window.location.href = '/estatisticas'}>
                  Ver Estatísticas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (session) {
    const currentQ = session.questions[session.currentQuestion];
    const progress = ((session.currentQuestion + 1) / session.questions.length) * 100;

    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Simulado ENEM</h1>
              <p className="text-muted-foreground">
                Questão {session.currentQuestion + 1} de {session.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono">{formatTime(session.timeElapsed)}</div>
              <div className="text-sm text-muted-foreground">Tempo decorrido</div>
            </div>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{currentQ.materia}</Badge>
                <Badge variant="outline">
                  Dificuldade: {currentQ.dificuldade}/3
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">{currentQ.enunciado}</h2>
              </div>

              <div className="space-y-3">
                {currentQ.alternativas.map((alt, index) => {
                  const letter = String.fromCharCode(97 + index); // a, b, c, d
                  const isSelected = session.answers[currentQ.id] === alt;
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => selectAnswer(currentQ.id, alt)}
                    >
                      <span className="font-semibold mr-3">{letter})</span>
                      <span>{alt}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetSimulado}
                >
                  Cancelar
                </Button>
                
                <Button 
                  onClick={nextQuestion}
                  disabled={!session.answers[currentQ.id]}
                >
                  {session.currentQuestion === session.questions.length - 1 ? 'Finalizar' : 'Próxima'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Simulados 🎯</h1>
          <p className="text-muted-foreground">
            Teste seus conhecimentos com questões no estilo ENEM! 📝
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Iniciar Simulado */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Novo Simulado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Escolha uma matéria ou faça um simulado geral com questões de todas as áreas.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Todas as Matérias', value: 'todas' },
                    { name: 'Matemática', value: 'Matemática' },
                    { name: 'História', value: 'História' },
                    { name: 'Geografia', value: 'Geografia' },
                    { name: 'Química', value: 'Química' },
                    { name: 'Física', value: 'Física' },
                    { name: 'Biologia', value: 'Biologia' },
                    { name: 'Português', value: 'Português' }
                  ].map((materia) => (
                    <Button
                      key={materia.value}
                      variant="outline"
                      className="h-auto p-3 text-center"
                      onClick={() => startSimulado(materia.value)}
                      disabled={loading}
                    >
                      {materia.name}
                    </Button>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 10 questões por simulado</p>
                  <p>• Questões no estilo ENEM</p>
                  <p>• Cronômetro automático</p>
                  <p>• Resultado instantâneo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Simulados Anteriores</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum simulado realizado ainda.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Faça seu primeiro simulado!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((sim) => (
                    <div key={sim.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sim.tipo}</span>
                        <Badge variant={sim.acertos_percent >= 70 ? "default" : "secondary"}>
                          {sim.acertos_percent}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{sim.acertos}/{sim.questoes_count} acertos</span>
                        <span>{new Date(sim.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <Progress value={sim.acertos_percent} className="h-2" />
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

export default Simulados;