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
    const { tema, texto, userId } = await req.json()

    if (!tema || !texto || !userId) {
      throw new Error('Tema, texto e userId são obrigatórios')
    }

    if (texto.length < 100) {
      throw new Error('A redação deve ter pelo menos 100 caracteres')
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

    // Verificar limite de uso para usuários free (3 correções por mês)
    if (usuario.plano === 'free') {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('redacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', inicioMes.toISOString())

      if (count && count >= 3) {
        throw new Error('Limite mensal de correções atingido. Faça upgrade para Premium!')
      }
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada')
    }

    // System prompt específico para correção de redação ENEM
    const systemPrompt = `Você é um corretor oficial do ENEM com experiência em avaliação de redações. Avalie a redação seguindo EXATAMENTE os critérios oficiais do ENEM.

CRITÉRIOS DE AVALIAÇÃO (0-200 pontos cada):

1. COMPETÊNCIA 1 - Domínio da modalidade escrita formal da língua portuguesa (0-200)
   - Avalie: ortografia, acentuação, pontuação, concordância, regência, flexão, sintaxe

2. COMPETÊNCIA 2 - Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento (0-200)
   - Avalie: compreensão do tema, uso de repertório sociocultural, articulação de conhecimentos

3. COMPETÊNCIA 3 - Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista (0-200)
   - Avalie: argumentação, coesão argumentativa, progressão textual, autoria

4. COMPETÊNCIA 4 - Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (0-200)
   - Avalie: conectivos, referências, sequenciação, coesão textual

5. COMPETÊNCIA 5 - Elaborar proposta de intervenção para o problema abordado (0-200)
   - Avalie: proposta de solução, detalhamento, viabilidade, articulação com o texto

TEMAS QUENTES ENEM 2025:
- Inteligência Artificial e impactos sociais
- Sustentabilidade e mudanças climáticas  
- Herança africana e combate ao racismo
- Desigualdade social e inclusão
- Saúde mental dos jovens
- Fake news e desinformação

FORMATO DA RESPOSTA:
{
  "nota_total": [soma das 5 competências],
  "competencias": {
    "competencia_1": [nota 0-200],
    "competencia_2": [nota 0-200], 
    "competencia_3": [nota 0-200],
    "competencia_4": [nota 0-200],
    "competencia_5": [nota 0-200]
  },
  "feedback": "Feedback detalhado explicando a nota de cada competência, pontos fortes, pontos a melhorar e sugestões específicas para aprimoramento. Seja construtivo e didático."
}

Tema da redação: ${tema}`

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
          { role: 'user', content: `Corrija esta redação sobre "${tema}":\n\n${texto}` }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erro na API do OpenAI')
    }

    const data = await response.json()
    const respostaIA = data.choices[0].message.content

    // Parse da resposta da IA
    let correcao
    try {
      correcao = JSON.parse(respostaIA)
    } catch (parseError) {
      // Se não conseguir fazer parse, criar estrutura básica
      correcao = {
        nota_total: 600,
        competencias: {
          competencia_1: 120,
          competencia_2: 120,
          competencia_3: 120,
          competencia_4: 120,
          competencia_5: 120
        },
        feedback: respostaIA
      }
    }

    // Salvar no banco de dados
    const { error: insertError } = await supabase
      .from('redacoes')
      .insert({
        user_id: userId,
        tema,
        texto,
        nota: correcao.nota_total,
        feedback_ia: correcao.feedback,
        competencia_1: correcao.competencias.competencia_1,
        competencia_2: correcao.competencias.competencia_2,
        competencia_3: correcao.competencias.competencia_3,
        competencia_4: correcao.competencias.competencia_4,
        competencia_5: correcao.competencias.competencia_5
      })

    if (insertError) {
      console.error('Erro ao salvar redação:', insertError)
    }

    return new Response(
      JSON.stringify(correcao),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Erro na correção de redação:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})