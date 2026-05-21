import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  ArrowRight, 
  ArrowDown,
  Lightbulb,
  ScanLine,
  CheckSquare,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HowToStep {
  order: number;
  instruction: string;
  visualHint?: string;
}

interface FlowOutcome {
  result: string;
  action: string;
  nextStep?: string;
  alertLevel?: 'success' | 'warning' | 'critical';
}

interface QuickTip {
  icon: string;
  message: string;
}

interface ActionFlowProps {
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
}

const iconMap: Record<string, React.ReactNode> = {
  'scan': <ScanLine className="w-5 h-5" />,
  'check': <CheckSquare className="w-5 h-5" />,
  'alert': <AlertOctagon className="w-5 h-5" />,
  'lightbulb': <Lightbulb className="w-5 h-5" />,
  'default': <Play className="w-5 h-5" />
};

export function ActionFlow({ howTo, ifOK, ifNOK, tips }: ActionFlowProps) {
  const hasFlow = howTo || ifOK || ifNOK;
  
  if (!hasFlow) return null;

  return (
    <div className="space-y-6">
      {/* Quick Tips - Badges visuais no topo */}
      {tips && tips.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {tips.map((tip, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs font-medium"
            >
              {iconMap[tip.icon] || iconMap['lightbulb']}
              <span>{tip.message}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* How To Section - Passo a passo visual */}
      {howTo && howTo.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Play className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
              Como Executar
            </h3>
          </div>

          <div className="space-y-3">
            {howTo.map((step, idx) => (
              <motion.div
                key={step.order}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {idx < howTo.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-6 bg-gradient-to-b from-blue-500/40 to-transparent" />
                )}
                
                <div className="flex gap-4">
                  {/* Step number bubble */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-sm">
                    {step.order}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 pt-2">
                    <p className="text-white text-sm leading-relaxed">
                      {step.instruction}
                    </p>
                    {step.visualHint && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-black/20 px-3 py-2 rounded-lg">
                        <ScanLine className="w-4 h-4" />
                        <span>{step.visualHint}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Decision Flow - OK vs NOK */}
      {(ifOK || ifNOK) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Flow title */}
          <div className="flex items-center justify-center">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="px-4 text-xs text-slate-400 uppercase tracking-wider">
              Resultado Esperado
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* OK Path - Verde */}
            {ifOK && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-4",
                  "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
                )}
              >
                <div className="absolute top-0 right-0 p-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/30" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Se OK
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">
                    {ifOK.result}
                  </p>
                  <div className="flex items-start gap-2 text-xs text-emerald-300/80">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{ifOK.action}</span>
                  </div>
                  {ifOK.nextStep && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/20">
                      <span className="text-xs text-slate-400">Próximo:</span>
                      <p className="text-xs text-emerald-300 mt-1">{ifOK.nextStep}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* NOK Path - Vermelho/Laranja */}
            {ifNOK && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-4",
                  ifNOK.alertLevel === 'critical' 
                    ? "bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30"
                    : "bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30"
                )}
              >
                <div className="absolute top-0 right-0 p-3">
                  <XCircle className={cn(
                    "w-8 h-8",
                    ifNOK.alertLevel === 'critical' ? "text-red-400/30" : "text-orange-400/30"
                  )} />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    ifNOK.alertLevel === 'critical' ? "bg-red-500/20" : "bg-orange-500/20"
                  )}>
                    {ifNOK.alertLevel === 'critical' ? (
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    ifNOK.alertLevel === 'critical' ? "text-red-400" : "text-orange-400"
                  )}>
                    Se NOK
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">
                    {ifNOK.result}
                  </p>
                  <div className={cn(
                    "flex items-start gap-2 text-xs",
                    ifNOK.alertLevel === 'critical' ? "text-red-300/80" : "text-orange-300/80"
                  )}>
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{ifNOK.action}</span>
                  </div>
                  {ifNOK.nextStep && (
                    <div className={cn(
                      "mt-3 pt-3 border-t",
                      ifNOK.alertLevel === 'critical' ? "border-red-500/20" : "border-orange-500/20"
                    )}>
                      <span className="text-xs text-slate-400">Ação:</span>
                      <p className={cn(
                        "text-xs mt-1",
                        ifNOK.alertLevel === 'critical' ? "text-red-300" : "text-orange-300"
                      )}>{ifNOK.nextStep}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
