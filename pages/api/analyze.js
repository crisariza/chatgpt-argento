import OpenAIApi from 'openai';
import argentinianData from '../../assets/lunfardo-argentino.json';

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

function createTrainingPrompt(text) {
    const examplesList = argentinianData.examples
        .map(ex => `Texto: "${ex.text}"\nCaracterísticas: ${ex.features.join(', ')}\n`)
        .join('\n');

    const commonFeaturesSummary = `
Características comunes del español argentino:
- Pronombres: ${argentinianData.commonFeatures.pronouns.join(', ')}
- Verbos de voseo: ${argentinianData.commonFeatures.verbs.voseo.join(', ')}
- Lunfardo común: ${argentinianData.commonFeatures.slang.nouns.join(', ')}
- Expresiones comunes: ${argentinianData.commonFeatures.expressions.join(', ')}
`;

    return `Eres un experto en lingüística del español argentino. Analiza los textos para determinar si están escritos en español argentino.

Aquí tienes algunos ejemplos de español argentino junto con sus características:

${examplesList}

${commonFeaturesSummary}

Con base en estos ejemplos y características, analiza el siguiente texto y determina si está escrito en español argentino. Busca patrones similares y explica tu razonamiento:

"${text}"`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ message: 'El texto es obligatorio y debe ser una cadena de texto.' });
        }

        // Enviar a ChatGPT nuestra data, el tipo de input que esperamos y el modelo a usar
        // Importante no cambiar el modelo sin testear, ya que puede usar formatos distintos
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: createTrainingPrompt(text),
                },
                {
                    role: "user",
                    content: `Analiza este texto y proporciona tu análisis en el siguiente formato de objeto JSON, no aclares el formato:
                    {
                      "confidence": (1, 2 o 3 según el nivel de confianza: 1 = Baja, 2 = Media, 3 = Alta),
                      "isArgentinian": (true o false, según si el texto es español argentino),
                      "details": "(Describe brevemente las características específicas identificadas)."
                    }`
                },
            ],
            temperature: 0.7,
        });

        // Handlear peticiones inesperadas
        if (!completion.choices || completion.choices.length === 0 || !completion.choices[0].message) {
            return res.status(500).json({ message: 'Respuesta inesperada del modelo.' });
        }

        const analysis = completion.choices[0].message.content;

        return res.status(200).json(
            JSON.parse(analysis)
        );
    } catch (error) {
        console.error('Error al analizar el texto:', error);

        // Enhanced error response
        return res.status(500).json({
            message: 'Error al procesar la solicitud.',
            error: error.message || 'Error desconocido',
        });
    }
}
