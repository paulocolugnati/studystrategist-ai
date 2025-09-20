import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pergunta, materia, userId } = await req.json()

    if (!pergunta || !userId) {
      throw new Error('Pergunta e userId são obrigatórios')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar plano do usuário e limites
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('plano')
      .eq('user_id', userId)
      .single()

    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar limite de uso para usuários free
    if (usuario.plano === 'free') {
      const hoje = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('chats_ia')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', hoje)

      if (count && count >= 5) {
        throw new Error('Limite diário de perguntas atingido. Faça upgrade para Premium!')
      }
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada')
    }

    // System prompt específico para ENEM
    const systemPrompt = `Você é um tutor especialista em ENEM com vasta experiência em preparação para vestibulares. 

DIRETRIZES:
- Responda de forma clara, didática e objetiva
- Use exemplos práticos quando relevante
- Inclua dicas específicas para a prova do ENEM quando apropriado
- Explique fórmulas e conceitos de forma simples
- Foque em conteúdos que realmente caem no ENEM
- Mencione temas transversais quando relevante (sustentabilidade, direitos humanos, tecnologia)

ÁREAS DE CONHECIMENTO ENEM:
- Matemática e suas Tecnologias
- Ciências da Natureza e suas Tecnologias  
- Ciências Humanas e suas Tecnologias
- Linguagens, Códigos e suas Tecnologias
- Redação

TEMAS QUENTES ENEM 2025:
- Inteligência Artificial e sociedade
- Mudanças climáticas e sustentabilidade
- Herança africana e cultura afro-brasileira
- Ditadura militar e redemocratização
- Desigualdade social e políticas públicas

Matéria atual: ${materia || 'Geral'}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: pergunta }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erro na API do OpenAI')
    }

    const data = await response.json()
    const resposta = data.choices[0].message.content

    // Salvar no banco de dados
    const { error: insertError } = await supabase
      .from('chats_ia')
      .insert({
        user_id: userId,
        pergunta,
        resposta,
        materia: materia || 'geral'
      })

    if (insertError) {
      console.error('Erro ao salvar chat:', insertError)
    }

    return new Response(
      JSON.stringify({ resposta }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Erro no chat-ia:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})