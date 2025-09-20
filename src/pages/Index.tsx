import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Target, BarChart3, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-8 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">E</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Estratégia<span className="text-primary">ENEM</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sua plataforma completa de preparação para o ENEM 2025. 
              Estude com inteligência artificial, simulados e planos personalizados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/registro">
                  Começar Gratuitamente
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>

            <div className="bg-accent/20 rounded-lg p-4 inline-block">
              <p className="text-sm font-medium text-accent-foreground">
                🎯 ENEM 2025: <span className="font-bold">9 e 16 de Novembro</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tudo que você precisa para o ENEM
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades desenvolvidas especificamente para maximizar seu desempenho no ENEM 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 card-shadow text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat com IA Especializada</h3>
              <p className="text-muted-foreground">
                Tire dúvidas em tempo real com nossa IA treinada especificamente para o ENEM
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 card-shadow text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Correção de Redação IA</h3>
              <p className="text-muted-foreground">
                Correção automática seguindo os critérios oficiais do ENEM com feedback detalhado
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 card-shadow text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simulados Personalizados</h3>
              <p className="text-muted-foreground">
                Simulados completos e por matéria com questões no estilo ENEM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Comece sua preparação hoje mesmo
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades básicas
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/registro">
              Criar conta gratuita
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 EstratégiaENEM. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
