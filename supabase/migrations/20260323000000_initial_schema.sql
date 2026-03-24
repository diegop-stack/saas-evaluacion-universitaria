-- ============================================================
-- IA HEROES EXAM SaaS — MIGRACIÓN COMPLETA (ADAPTADA)
-- ============================================================

-- Profiles (Adaptada para acceso sin contraseña)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  nationality TEXT,
  dni TEXT,
  is_authorized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams
CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('classic')) DEFAULT 'classic',
  duration_minutes INTEGER NOT NULL DEFAULT 40,
  question_count INTEGER NOT NULL DEFAULT 30,
  pass_score_percent INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Windows
CREATE TABLE public.exam_windows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Questions
CREATE TABLE public.exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Attempts
CREATE TABLE public.exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  score INTEGER,
  total_questions INTEGER DEFAULT 30,
  passed BOOLEAN,
  attempt_number INTEGER NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'annulled')) DEFAULT 'in_progress',
  annulled_reason TEXT,
  tab_switch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exam_id, attempt_number)
);

-- Exam Responses
CREATE TABLE public.exam_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.exam_questions(id) NOT NULL,
  user_answer INTEGER,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) NOT NULL,
  exam_attempt_id UUID REFERENCES public.exam_attempts(id) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_code TEXT UNIQUE NOT NULL,
  UNIQUE(user_id, program_id)
);

-- RLS (Habilitado pero con políticas simplificadas para el MVP con sesión personalizada)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by service role" ON public.profiles FOR ALL USING (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active programs" ON public.programs FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active exams" ON public.exams FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
-- No policy for questions means only service_role can read them (secure)

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attempts are manageable by service role" ON public.exam_attempts FOR ALL USING (true);

ALTER TABLE public.exam_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responses are manageable by service role" ON public.exam_responses FOR ALL USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.programs (name, slug, description)
VALUES (
  'IA Heroes Pro 2026',
  'ia-heroes-pro-2026',
  'Programa Universitari en Intel·ligència Artificial — 60 ECTS — Western Europe University & Learning Heroes Tech School. 12 meses, 12 industrias.'
);

INSERT INTO public.exams (program_id, title, mode, duration_minutes, question_count, pass_score_percent)
SELECT
  id,
  'Examen de Certificación — IA Heroes Pro 2026',
  'classic',
  40,
  30,
  20
FROM public.programs
WHERE slug = 'ia-heroes-pro-2026';

INSERT INTO public.exam_windows (exam_id, opens_at, closes_at)
SELECT
  id,
  NOW(),
  NOW() + INTERVAL '30 days'
FROM public.exams
WHERE title = 'Examen de Certificación — IA Heroes Pro 2026';

-- Usuarios iniciales autorizados
INSERT INTO public.profiles (email, is_authorized)
VALUES 
('test@iaheroes.pro', TRUE),
('diego@learningheroes.pro', TRUE);

-- BANCO DE PREGUNTAS (40 preguntas proporcionadas)
DO $$
DECLARE
  v_exam_id UUID;
BEGIN
  SELECT id INTO v_exam_id FROM public.exams WHERE title = 'Examen de Certificación — IA Heroes Pro 2026' LIMIT 1;

  -- Pensamiento crítico y transformación tecnológica
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, '¿Qué concepto describe el fenómeno por el cual la tecnología avanza a un ritmo cada vez más acelerado, duplicando su capacidad en períodos cada vez más cortos?', '["Evolución lineal", "Crecimiento exponencial", "Progresión aritmética", "Desarrollo sostenible"]', 1, 'easy', 'Pensamiento crítico'),
  (v_exam_id, 'La Ley de Moore predice que aproximadamente cada dos años:', '["El precio de los ordenadores se duplica", "El número de transistores en un chip se duplica", "La velocidad de Internet se triplica", "El consumo energético de los procesadores se reduce a la mitad"]', 1, 'easy', 'Pensamiento crítico'),
  (v_exam_id, '¿Cuál de las siguientes afirmaciones refleja mejor el impacto del cambio exponencial en la sociedad?', '["Los cambios tecnológicos afectan solo al sector tecnológico", "La transformación digital impacta de forma transversal en todas las industrias y ámbitos sociales", "El cambio exponencial solo es relevante para las grandes empresas", "La sociedad se adapta automáticamente sin necesidad de formación"]', 1, 'easy', 'Pensamiento crítico'),
  (v_exam_id, '¿Qué autor o concepto se asocia comúnmente con la idea de ''singularidad tecnológica''?', '["Elon Musk y la colonización de Marte", "Ray Kurzweil y el momento en que la IA supere la inteligencia humana", "Steve Jobs y el diseño centrado en el usuario", "Tim Berners-Lee y la creación de la web"]', 1, 'easy', 'Pensamiento crítico');

  -- Alfabetización digital y conceptos clave de IA
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, '¿Qué tipo de inteligencia artificial es capaz de realizar una tarea específica, como reconocer imágenes o traducir texto, pero no puede generalizar a otras tareas?', '["IA General (AGI)", "IA Estrecha o Débil (ANI)", "IA Superinteligente", "IA Cuántica"]', 1, 'easy', 'Alfabetización digital'),
  (v_exam_id, '¿Cuál es la diferencia principal entre Machine Learning y Deep Learning?', '["No hay diferencia, son sinónimos", "Deep Learning utiliza redes neuronales con múltiples capas, mientras que Machine Learning abarca técnicas más amplias de aprendizaje automático", "Machine Learning es más avanzado que Deep Learning", "Deep Learning no necesita datos para funcionar"]', 1, 'easy', 'Alfabetización digital'),
  (v_exam_id, '¿Qué significa el acrónimo LLM en el contexto de la inteligencia artificial?', '["Low Latency Model", "Large Language Model", "Linear Learning Machine", "Logical Linguistic Module"]', 1, 'easy', 'Alfabetización digital'),
  (v_exam_id, '¿Cuál de estos es un ejemplo de IA generativa?', '["Un filtro de spam en el correo electrónico", "Un modelo que crea imágenes a partir de descripciones de texto", "Un sensor de temperatura en una fábrica", "Un algoritmo de ordenación de datos"]', 1, 'easy', 'Alfabetización digital');

  -- Prompt Engineering
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, 'En Prompt Engineering, ¿qué técnica consiste en proporcionar al modelo varios ejemplos dentro del prompt para guiar el formato y estilo de la respuesta?', '["Zero-shot prompting", "Few-shot prompting", "Chain-of-thought", "Temperature tuning"]', 1, 'easy', 'Prompt Engineering'),
  (v_exam_id, '¿Qué parámetro de un LLM controla el nivel de aleatoriedad o creatividad en las respuestas generadas?', '["Max tokens", "Temperatura", "Top-K", "Frecuencia de penalización"]', 1, 'easy', 'Prompt Engineering'),
  (v_exam_id, '¿Cuál de las siguientes es una buena práctica al escribir prompts efectivos?', '["Escribir instrucciones lo más vagas posible para dar libertad al modelo", "Ser específico, dar contexto, definir el formato de salida esperado y el rol del modelo", "Usar siempre prompts de una sola palabra", "Evitar dar ejemplos para no confundir al modelo"]', 1, 'easy', 'Prompt Engineering'),
  (v_exam_id, 'La técnica ''Chain-of-Thought'' en prompting consiste en:', '["Encadenar múltiples modelos de IA para una sola tarea", "Pedir al modelo que razone paso a paso antes de dar una respuesta final", "Conectar varios prompts en una cadena de correos electrónicos", "Utilizar exclusivamente preguntas cerradas de sí o no"]', 1, 'easy', 'Prompt Engineering');

  -- Chatbots con IA
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, '¿Qué componente es esencial en un chatbot profesional para mantener el contexto de la conversación con el usuario?', '["Un diseño gráfico atractivo", "Un sistema de memoria o historial de conversación", "Una base de datos de imágenes", "Un dominio web propio"]', 1, 'easy', 'Chatbots con IA'),
  (v_exam_id, '¿Qué es RAG (Retrieval-Augmented Generation) en el contexto de chatbots con IA?', '["Un lenguaje de programación para chatbots", "Una técnica que combina búsqueda en bases de datos propias con generación de respuestas por IA", "Un tipo de red neuronal exclusiva para chat", "Un protocolo de seguridad para conversaciones"]', 1, 'easy', 'Chatbots con IA'),
  (v_exam_id, 'Al integrar un chatbot con IA en un negocio, ¿cuál de estos casos de uso aporta mayor valor inmediato?', '["Reemplazar completamente al equipo humano de atención al cliente", "Automatizar respuestas a preguntas frecuentes y cualificar leads antes de pasar a un agente humano", "Generar código fuente para la web de la empresa", "Publicar contenido en redes sociales automáticamente"]', 1, 'easy', 'Chatbots con IA'),
  (v_exam_id, '¿Qué plataforma o herramienta permite crear chatbots con IA sin necesidad de programar, utilizando interfaces visuales de arrastrar y soltar?', '["Solo se pueden crear chatbots escribiendo código Python", "Herramientas no-code/low-code como Voiceflow, Botpress o similares", "Microsoft Excel con macros", "Adobe Photoshop con plugins de IA"]', 1, 'easy', 'Chatbots con IA');

  -- IA generativa para contenido multimedia
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, '¿Qué herramienta de IA generativa es conocida por crear imágenes de alta calidad a partir de descripciones de texto (text-to-image)?', '["ChatGPT", "Midjourney", "Notion AI", "Grammarly"]', 1, 'easy', 'Multimedia'),
  (v_exam_id, '¿Qué son los ''deepfakes'' en el contexto de la IA aplicada a contenido audiovisual?', '["Imágenes generadas por IA que siempre tienen marcas de agua visibles", "Contenido multimedia manipulado mediante IA que puede resultar indistinguible del real, planteando retos éticos", "Vídeos grabados con cámaras de muy alta resolución", "Un formato de archivo de vídeo comprimido"]', 1, 'easy', 'Multimedia'),
  (v_exam_id, '¿Cuál de estas herramientas se utiliza para generar vídeo con inteligencia artificial?', '["Canva", "Sora de OpenAI", "Google Sheets", "Trello"]', 1, 'easy', 'Multimedia'),
  (v_exam_id, 'Al utilizar IA generativa para crear contenido audiovisual comercial, ¿qué aspecto legal es fundamental tener en cuenta?', '["No existe ninguna regulación sobre contenido generado por IA", "Los derechos de autor, la propiedad intelectual del contenido generado y la transparencia sobre su origen artificial", "Solo es necesario pagar la suscripción de la herramienta", "Basta con añadir un filtro de color para evitar problemas legales"]', 1, 'easy', 'Multimedia');

  -- Impacto de la IA en el empleo
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, 'Según múltiples estudios sobre el futuro del trabajo, la IA probablemente:', '["Eliminará todos los empleos en los próximos 5 años", "Transformará la mayoría de los puestos de trabajo, automatizando tareas repetitivas y creando nuevos roles", "No tendrá ningún impacto significativo en el mercado laboral", "Solo afectará a los trabajadores del sector tecnológico"]', 1, 'easy', 'Empleo'),
  (v_exam_id, '¿Qué habilidad humana se considera más difícil de reemplazar por la IA y, por tanto, más valiosa en el futuro laboral?', '["La capacidad de procesar grandes volúmenes de datos", "El pensamiento crítico, la creatividad y la inteligencia emocional", "La velocidad de cálculo matemático", "La memorización de información factual"]', 1, 'easy', 'Empleo'),
  (v_exam_id, '¿Qué concepto describe la necesidad de actualizar continuamente las habilidades profesionales para adaptarse a los cambios tecnológicos?', '["Networking", "Reskilling y upskilling", "Outsourcing", "Benchmarking"]', 1, 'easy', 'Empleo'),
  (v_exam_id, 'En el contexto del futuro laboral con IA, ¿qué significa ser un ''profesional aumentado''?', '["Un profesional que trabaja más horas gracias a la tecnología", "Un profesional que utiliza herramientas de IA para potenciar sus capacidades y ser más productivo", "Un profesional que ha sido reemplazado por un robot", "Un profesional que solo trabaja en el sector de la IA"]', 1, 'easy', 'Empleo');

  -- Emprendimiento e IA generativa
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, 'Al crear una propuesta de valor para un servicio de IA, ¿qué elemento es más importante?', '["Utilizar la mayor cantidad posible de jerga técnica", "Comunicar claramente qué problema resuelve, para quién, y qué resultado tangible ofrece", "Ofrecer el precio más bajo del mercado", "Tener el logo más llamativo"]', 1, 'easy', 'Emprendimiento'),
  (v_exam_id, '¿Cuál es un modelo de negocio viable para ofrecer servicios de IA generativa a empresas?', '["Regalar todos los servicios para conseguir usuarios", "Ofrecer consultoría e implementación de soluciones de IA por proyecto o retainer mensual", "Esperar a que la IA sea perfecta antes de vender nada", "Vender hardware de servidores exclusivamente"]', 1, 'easy', 'Emprendimiento'),
  (v_exam_id, 'Para identificar oportunidades de negocio con IA, ¿qué enfoque es más efectivo?', '["Buscar problemas reales en industrias específicas donde la IA pueda aportar una solución escalable", "Crear tecnología primero y luego buscar un problema que resolver", "Copiar exactamente lo que hace la competencia", "Centrarse únicamente en el mercado de consumo masivo"]', 0, 'easy', 'Emprendimiento'),
  (v_exam_id, 'En una negociación comercial para vender servicios de IA, ¿cuál de estas estrategias es más profesional?', '["Prometer que la IA puede hacer cualquier cosa que el cliente pida", "Ser transparente sobre las capacidades y limitaciones de la IA, estableciendo expectativas realistas", "Evitar hablar de precios hasta el último momento", "Utilizar términos técnicos que el cliente no entienda para parecer más experto"]', 1, 'easy', 'Emprendimiento');

  -- Casos prácticos y resolución de problemas
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, 'Una empresa de retail quiere reducir el tiempo de respuesta a clientes. ¿Cuál sería la aplicación más adecuada de IA?', '["Reemplazar toda la plantilla por robots físicos", "Implementar un chatbot con IA entrenado con las FAQs y políticas de la empresa, con escalado a agente humano", "Enviar todas las consultas por correo postal", "Crear una app móvil sin ninguna funcionalidad de IA"]', 1, 'easy', 'Casos prácticos'),
  (v_exam_id, 'Un creador de contenido quiere producir vídeos cortos para redes sociales de forma más eficiente. ¿Qué flujo de trabajo con IA sería más práctico?', '["Grabar todo manualmente y no usar ninguna herramienta de IA", "Usar IA para generar guiones, crear voiceovers sintéticos, y generar/editar clips de vídeo, revisando siempre el resultado final", "Dejar que la IA publique automáticamente sin revisión humana", "Solo usar IA para elegir los hashtags"]', 1, 'easy', 'Casos prácticos'),
  (v_exam_id, '¿Cuál es el mayor riesgo de implementar una solución de IA sin supervisión humana en un proceso de negocio crítico?', '["Que la IA funcione demasiado rápido", "Que genere errores, sesgos o alucinaciones que afecten a clientes o decisiones importantes sin ser detectados", "Que consuma demasiada electricidad", "Que los empleados se aburran"]', 1, 'easy', 'Casos prácticos'),
  (v_exam_id, 'Una clínica dental quiere usar IA para mejorar su marketing. ¿Cuál de estas aplicaciones es más realista y efectiva?', '["Usar IA para diagnosticar enfermedades dentales sin supervisión médica", "Generar contenido educativo para redes sociales, automatizar respuestas a consultas frecuentes y personalizar campañas de email", "Reemplazar a los dentistas con robots quirúrgicos", "Crear un metaverso dental completo"]', 1, 'easy', 'Casos prácticos');

  -- Actualización continua en IA
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, '¿Por qué es importante mantenerse actualizado constantemente en el campo de la IA?', '["Porque las herramientas y modelos evolucionan muy rápidamente, y lo que funciona hoy puede ser obsoleto en meses", "No es necesario, la IA no cambia desde hace años", "Solo los programadores necesitan actualizarse", "Basta con leer un libro al año sobre tecnología"]', 0, 'easy', 'Actualización'),
  (v_exam_id, '¿Qué es un ''modelo fundacional'' (foundation model) en IA?', '["Un modelo de negocio para startups de IA", "Un modelo de gran escala preentrenado con enormes cantidades de datos que sirve como base para múltiples aplicaciones", "El primer prototipo de cualquier proyecto de software", "Un documento legal para fundar una empresa de IA"]', 1, 'easy', 'Actualización'),
  (v_exam_id, '¿Cuál de estos es un ejemplo de tendencia actual relevante en IA (2025-2026)?', '["Los disquetes como medio de almacenamiento para modelos de IA", "Los agentes de IA autónomos capaces de planificar y ejecutar tareas complejas de forma independiente", "La desaparición completa del internet", "La prohibición global de toda forma de inteligencia artificial"]', 1, 'easy', 'Actualización'),
  (v_exam_id, '¿Qué estrategia es más efectiva para mantenerse al día con los avances en IA?', '["Esperar a que alguien te lo cuente", "Combinar formación continua, seguir fuentes especializadas, experimentar con nuevas herramientas y participar en comunidades del sector", "Leer solo titulares de periódicos generalistas", "Ignorar todo hasta que sea absolutamente obligatorio"]', 1, 'easy', 'Actualización');

  -- Aplicación de soluciones avanzadas de IA
  INSERT INTO public.exam_questions (exam_id, question_text, options, correct_answer, difficulty, category) VALUES
  (v_exam_id, 'Al implementar una solución de IA en una empresa, ¿qué paso es fundamental antes de elegir la herramienta tecnológica?', '["Comprar el hardware más caro disponible", "Definir claramente el problema a resolver, los KPIs de éxito y los datos disponibles", "Publicar un comunicado de prensa sobre la innovación", "Contratar inmediatamente a 10 ingenieros de IA"]', 1, 'easy', 'Soluciones avanzadas'),
  (v_exam_id, '¿Qué significa ''fine-tuning'' en el contexto de modelos de IA?', '["Ajustar el brillo de la pantalla al usar herramientas de IA", "Reentrenar un modelo preexistente con datos específicos de un dominio o empresa para mejorar su rendimiento en tareas concretas", "Eliminar completamente un modelo y empezar de cero", "Traducir un modelo de IA a otro idioma"]', 1, 'easy', 'Soluciones avanzadas'),
  (v_exam_id, '¿Cuál de estos factores es crítico para el éxito de un proyecto de IA en una organización?', '["Tener la IA más avanzada del mercado, independientemente del problema", "La calidad de los datos, el apoyo de la dirección y la alineación con objetivos de negocio reales", "Que el proyecto lo lidere exclusivamente el departamento de IT sin involucrar a otros equipos", "Implementar la IA en todos los procesos simultáneamente"]', 1, 'easy', 'Soluciones avanzadas'),
  (v_exam_id, 'Un experto del sector comparte un caso de uso donde una cadena hotelera usa IA para personalizar la experiencia del huésped. ¿Qué tecnología es más probable que estén utilizando?', '["Blockchain para gestionar reservas", "Sistemas de recomendación basados en IA que analizan preferencias y comportamiento del cliente para personalizar ofertas y servicios", "Impresoras 3D para crear habitaciones personalizadas", "Drones autónomos para el servicio de habitaciones"]', 1, 'easy', 'Soluciones avanzadas');

END $$;
