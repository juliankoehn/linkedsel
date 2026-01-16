/**
 * Prompt for Step 1: Content Outline Generation
 * Includes few-shot examples for better results
 */

export interface ContentOutlinePromptContext {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
}

const styleDescriptions = {
  professional: {
    de: 'Professionell und business-orientiert. Klare, prägnante Aussagen. Fokus auf Mehrwert und Expertise.',
    en: 'Professional and business-oriented. Clear, concise statements. Focus on value and expertise.',
  },
  casual: {
    de: 'Locker und nahbar. Konversationeller Ton. Persönliche Ansprache.',
    en: 'Casual and approachable. Conversational tone. Personal address.',
  },
  educational: {
    de: 'Lehrreich und informativ. Strukturierte Wissensvermittlung. Klare Schritte und Erklärungen.',
    en: 'Educational and informative. Structured knowledge transfer. Clear steps and explanations.',
  },
  inspirational: {
    de: 'Inspirierend und motivierend. Emotionale Ansprache. Mutige Aussagen.',
    en: 'Inspiring and motivating. Emotional appeal. Bold statements.',
  },
}

const fewShotExamples = {
  de: `
BEISPIEL 1 - Thema: "5 Tipps für besseres Zeitmanagement"
{
  "title": "Zeitmanagement Meistern",
  "slides": [
    {
      "type": "hook",
      "headline": "Arbeitest du hart oder smart?",
      "subheadline": "5 Zeitmanagement-Strategien, die alles verändern"
    },
    {
      "type": "content",
      "headline": "1. Die 2-Minuten-Regel",
      "body": "Wenn eine Aufgabe weniger als 2 Minuten dauert, erledige sie sofort. Kein Aufschieben, kein Notieren."
    },
    {
      "type": "list",
      "headline": "2. Priorisiere mit der Eisenhower-Matrix",
      "bullets": [
        "Wichtig + Dringend → Sofort erledigen",
        "Wichtig + Nicht dringend → Planen",
        "Nicht wichtig + Dringend → Delegieren",
        "Nicht wichtig + Nicht dringend → Streichen"
      ]
    },
    {
      "type": "content",
      "headline": "3. Time-Blocking",
      "body": "Reserviere feste Zeitblöcke für ähnliche Aufgaben. Multitasking ist ein Mythos - Fokus ist der Schlüssel."
    },
    {
      "type": "cta",
      "headline": "Bereit für mehr Produktivität?",
      "body": "Starte heute mit nur einer dieser Strategien.",
      "cta": "Folge für mehr Tipps"
    }
  ]
}

BEISPIEL 2 - Thema: "Warum emotionale Intelligenz wichtiger ist als IQ"
{
  "title": "EQ schlägt IQ",
  "slides": [
    {
      "type": "hook",
      "headline": "Die erfolgreichsten Menschen haben etwas gemeinsam",
      "subheadline": "Und es ist nicht ihr IQ"
    },
    {
      "type": "quote",
      "headline": "Was die Forschung sagt",
      "quote": "90% der Top-Performer haben eine überdurchschnittliche emotionale Intelligenz.",
      "attribution": "TalentSmart Studie"
    },
    {
      "type": "list",
      "headline": "Die 4 Säulen der EQ",
      "bullets": [
        "Selbstwahrnehmung - Eigene Emotionen erkennen",
        "Selbstregulation - Impulse kontrollieren",
        "Empathie - Andere verstehen",
        "Soziale Kompetenz - Beziehungen pflegen"
      ]
    },
    {
      "type": "content",
      "headline": "Die gute Nachricht",
      "body": "Anders als IQ ist emotionale Intelligenz trainierbar. Jeden Tag ein bisschen besser."
    },
    {
      "type": "cta",
      "headline": "Starte heute",
      "body": "Der erste Schritt: Achte auf deine Reaktionen.",
      "cta": "Speichern & Teilen"
    }
  ]
}`,
  en: `
EXAMPLE 1 - Topic: "5 Tips for Better Time Management"
{
  "title": "Master Time Management",
  "slides": [
    {
      "type": "hook",
      "headline": "Are you working hard or smart?",
      "subheadline": "5 time management strategies that change everything"
    },
    {
      "type": "content",
      "headline": "1. The 2-Minute Rule",
      "body": "If a task takes less than 2 minutes, do it immediately. No postponing, no noting down."
    },
    {
      "type": "list",
      "headline": "2. Prioritize with Eisenhower Matrix",
      "bullets": [
        "Important + Urgent → Do immediately",
        "Important + Not urgent → Schedule",
        "Not important + Urgent → Delegate",
        "Not important + Not urgent → Delete"
      ]
    },
    {
      "type": "content",
      "headline": "3. Time-Blocking",
      "body": "Reserve fixed time blocks for similar tasks. Multitasking is a myth - focus is the key."
    },
    {
      "type": "cta",
      "headline": "Ready for more productivity?",
      "body": "Start today with just one of these strategies.",
      "cta": "Follow for more tips"
    }
  ]
}

EXAMPLE 2 - Topic: "Why Emotional Intelligence Matters More Than IQ"
{
  "title": "EQ Beats IQ",
  "slides": [
    {
      "type": "hook",
      "headline": "The most successful people have something in common",
      "subheadline": "And it's not their IQ"
    },
    {
      "type": "quote",
      "headline": "What Research Says",
      "quote": "90% of top performers have above-average emotional intelligence.",
      "attribution": "TalentSmart Study"
    },
    {
      "type": "list",
      "headline": "The 4 Pillars of EQ",
      "bullets": [
        "Self-awareness - Recognize your emotions",
        "Self-regulation - Control impulses",
        "Empathy - Understand others",
        "Social skills - Build relationships"
      ]
    },
    {
      "type": "content",
      "headline": "The Good News",
      "body": "Unlike IQ, emotional intelligence is trainable. A little better every day."
    },
    {
      "type": "cta",
      "headline": "Start Today",
      "body": "First step: Pay attention to your reactions.",
      "cta": "Save & Share"
    }
  ]
}`,
}

export function buildContentOutlinePrompt(context: ContentOutlinePromptContext): {
  system: string
  user: string
} {
  const { topic, style, slideCount, language } = context

  const system =
    language === 'de'
      ? `Du bist ein erfahrener Content-Stratege für Social Media Carousels.
Deine Aufgabe ist es, strukturierte Content-Outlines zu erstellen, die Menschen fesseln und zum Engagement anregen.

STIL: ${styleDescriptions[style].de}

SLIDE-TYPEN:
- "hook": Erster Slide - Muss Aufmerksamkeit erregen. Nutze Fragen, überraschende Aussagen oder provokante Thesen.
- "content": Informativer Slide mit Headline und erklärendem Body-Text.
- "list": Slide mit Aufzählungspunkten. Ideal für Tipps, Schritte oder Vergleiche.
- "quote": Slide mit einem Zitat. Nutze Statistiken, Expertenmeinungen oder inspirierende Aussagen.
- "cta": Letzter Slide - Call-to-Action. Fordere zum Handeln auf.

REGELN:
1. Der ERSTE Slide MUSS vom Typ "hook" sein
2. Der LETZTE Slide MUSS vom Typ "cta" sein
3. Variiere die Slide-Typen dazwischen
4. Headlines sollten KURZ und PRÄGNANT sein (max 10 Worte)
5. Body-Text sollte VERSTÄNDLICH und KONKRET sein
6. Bei Listen: 3-5 Punkte, jeder Punkt kurz und scanbar

${fewShotExamples.de}`
      : `You are an experienced content strategist for social media carousels.
Your task is to create structured content outlines that captivate people and encourage engagement.

STYLE: ${styleDescriptions[style].en}

SLIDE TYPES:
- "hook": First slide - Must grab attention. Use questions, surprising statements, or provocative theses.
- "content": Informative slide with headline and explanatory body text.
- "list": Slide with bullet points. Ideal for tips, steps, or comparisons.
- "quote": Slide with a quote. Use statistics, expert opinions, or inspiring statements.
- "cta": Last slide - Call-to-action. Encourage action.

RULES:
1. The FIRST slide MUST be type "hook"
2. The LAST slide MUST be type "cta"
3. Vary the slide types in between
4. Headlines should be SHORT and CONCISE (max 10 words)
5. Body text should be UNDERSTANDABLE and CONCRETE
6. For lists: 3-5 points, each point short and scannable

${fewShotExamples.en}`

  const user =
    language === 'de'
      ? `Erstelle einen Content-Outline für ein ${slideCount}-Slide Carousel über: "${topic}"`
      : `Create a content outline for a ${slideCount}-slide carousel about: "${topic}"`

  return { system, user }
}
