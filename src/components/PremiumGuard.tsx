import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';

interface PremiumGuardProps {
  isPremium: boolean;
  children: ReactNode;
  featureName: string;
}

const PremiumGuard = ({ isPremium, children, featureName }: PremiumGuardProps) => {
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="container py-8">
      <Card className="card-shadow max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-xl">Recurso Premium 🚀</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            O recurso <strong>{featureName}</strong> está disponível apenas para usuários Premium.
          </p>
          
          <div className="bg-accent/5 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-accent flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              Premium Benefits
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Chat IA ilimitado</li>
              <li>✅ Correção de redações</li>
              <li>✅ Simulados personalizados</li>
              <li>✅ Planos de estudo com IA</li>
              <li>✅ Estatísticas avançadas</li>
            </ul>
          </div>

          <Button 
            onClick={() => navigate('/premium')}
            className="w-full"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade para Premium
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumGuard;