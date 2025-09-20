import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, ExternalLink, FileText, Video, Globe } from 'lucide-react';

interface Resource {
  id: string;
  titulo: string;
  tipo: string;
  materia: string;
  resumo: string;
  url: string;
}

const Biblioteca = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterMateria, setFilterMateria] = useState('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, filterType, filterMateria, resources]);

  const loadResources = async () => {
    try {
      const { data } = await supabase
        .from('biblioteca')
        .select('*')
        .order('titulo');

      if (data) {
        setResources(data);
      }
    } catch (error) {
      console.error('Erro ao carregar recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.materia.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'todos') {
      filtered = filtered.filter(resource => resource.tipo === filterType);
    }

    if (filterMateria !== 'todas') {
      filtered = filtered.filter(resource => resource.materia === filterMateria);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'vídeo':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'site':
        return <Globe className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'vídeo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'site':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const materias = [...new Set(resources.map(r => r.materia))];
  const tipos = [...new Set(resources.map(r => r.tipo))];

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Biblioteca 📚</h1>
          <p className="text-muted-foreground">
            Acesse materiais de estudo, videoaulas e recursos para o ENEM 2025! 🎓
          </p>
        </div>

        {/* Filtros */}
        <Card className="card-shadow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filterMateria} onValueChange={setFilterMateria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as matérias</SelectItem>
                    {materias.map((materia) => (
                      <SelectItem key={materia} value={materia}>
                        {materia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'todos' || filterMateria !== 'todas'
                  ? 'Nenhum recurso encontrado com os filtros aplicados.'
                  : 'Nenhum recurso disponível ainda.'}
              </p>
            </div>
          ) : (
            filteredResources.map((resource) => (
              <Card key={resource.id} className="card-shadow hover:card-shadow-lg transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.tipo)}
                      <Badge className={getTypeColor(resource.tipo)}>
                        {resource.tipo}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {resource.materia}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {resource.titulo}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {resource.resumo}
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Recurso
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        {filteredResources.length > 0 && (
          <Card className="card-shadow mt-8">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{filteredResources.length}</div>
                  <div className="text-sm text-muted-foreground">Recursos encontrados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {filteredResources.filter(r => r.tipo === 'PDF').length}
                  </div>
                  <div className="text-sm text-muted-foreground">PDFs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {filteredResources.filter(r => r.tipo === 'Vídeo').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Vídeos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {materias.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Matérias</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Biblioteca;