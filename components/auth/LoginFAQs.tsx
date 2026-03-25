'use client'

import { HelpCircle, Clock, ShieldAlert, GraduationCap, CreditCard, AlertTriangle } from "lucide-react"

export function LoginFAQs() {
  const faqs = [
    {
      question: "¿Cuántos intentos tengo para aprobar?",
      answer: "Dispones de un máximo de 3 intentos totales. Tras un intento fallido, el sistema se bloqueará durante 24 horas por seguridad antes de permitir el próximo acceso.",
      icon: ShieldAlert
    },
    {
      question: "¿Cuál es el tiempo límite del examen?",
      answer: "Cada convocatoria tiene un tiempo estrictamente asignado de 40 MINUTOS. Una vez iniciado, el cronómetro no se detiene bajo ninguna circunstancia.",
      icon: Clock
    },
    {
       question: "¿Cuándo recibiré mi diploma oficial?",
       answer: "La certificación es emitida por la Western European University (WEU). Tras aprobar, el proceso de expedición puede demorar algunos meses hasta llegar a tu correo.",
       icon: GraduationCap
    },
    {
       question: "¿Estado de cuotas y pagos?",
       answer: "Es requisito INDISPENSABLE estar al corriente de todas tus cuotas con Learning Heroes para que el diploma sea tramitado ante la universidad.",
       icon: CreditCard,
       highlight: true
    }
  ]

  return (
    <div className="w-full max-w-2xl mx-auto px-6 space-y-10">
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
           <HelpCircle className="h-3 w-3 text-zinc-500" />
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Preguntas Frecuentes</span>
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-center">Protocolo de Certificación</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, i) => (
          <div 
            key={i} 
            className={`border p-8 rounded-3xl transition-all group ${
              faq.highlight 
                ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(36,63,76,0.3)]' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
            }`}
          >
             <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${
                  faq.highlight ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}>
                   <faq.icon className="h-4 w-4" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{faq.question}</h4>
             </div>
             <p className={`text-[11px] font-medium leading-relaxed ${
               faq.highlight ? 'text-zinc-300' : 'text-zinc-500'
             }`}>
               {faq.answer}
             </p>
             {faq.highlight && (
               <div className="mt-4 flex items-center space-x-2 text-[9px] font-black text-primary uppercase tracking-widest">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Requisito Crítico</span>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  )
}
