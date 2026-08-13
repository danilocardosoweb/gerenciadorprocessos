/**
 * CertificateGenerator Component
 * Generates and displays completion certificates for assessments
 */

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Printer, Award, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import type { AssessmentCertificate } from '../types/assessments';

interface CertificateGeneratorProps {
  attemptId: string;
  userId: string;
  onClose: () => void;
}

export function CertificateGenerator({ attemptId, userId, onClose }: CertificateGeneratorProps) {
  const { generateCertificate } = useAssessments();
  const [certificate, setCertificate] = useState<AssessmentCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const paperType = certificate.certificate_paper_type || certificate.certificate_style || 'premium';

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const cert = await generateCertificate(attemptId, userId);
      if (cert) {
        setCertificate(cert);
        setGenerated(true);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificateRef.current) return;

    // In a real implementation, this would use html2canvas or similar
    // For now, we'll create a simple text-based download
    const text = `
${certificate.certificate_title || 'CERTIFICADO DE CONCLUSO'}

${certificate.certificate_subtitle || 'Reconhecimento oficial da trilha aprovada'}

Este certificado confirma que o usuário completou com sucesso
a avaliação: ${certificate.assessment_title || 'Avaliação'}

Data de concluso: ${certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('pt-BR') : ''}

Pontuação: ${certificate.score || 0}%

ID do Certificado: ${certificate.certificate_number || 'N/A'}
Emissor: ${certificate.issuer_name || 'Tecno Mapper'}
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${certificate.certificate_number || 'avaliacao'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!certificateRef.current) return;
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate.certificate_title || 'Certificado de Concluso',
          text: `Completei a avaliação ${certificate.assessment_title} com ${certificate.score}% de aproveitamento!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const getPaperAccent = (type: string) => {
    switch (type) {
      case 'corporate':
        return '#60a5fa';
      case 'minimal':
        return '#94a3b8';
      case 'parchment':
        return '#d6a76d';
      case 'linen':
        return '#34d399';
      case 'executive':
        return '#818cf8';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Certificado</h2>
                <p className="text-white/80 text-sm">Gerar e compartilhar a comprovao da trilha concluda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!generated ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_30%)]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Reconhecimento digital
                  </div>
                  <h3 className="mt-5 text-3xl font-bold text-white leading-tight">
                    Gere um certificado premium para validar a trilha concluída.
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                    O certificado carrega nome, avaliação, nota, identificação e link de verificação para uso interno, educacional e corporativo.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      { title: 'Identidade', value: 'Nome + matrícula' },
                      { title: 'Rastreabilidade', value: 'ID único' },
                      { title: 'Validao', value: 'Link de conferência' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{item.title}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(249,115,22,0.28)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Award className="h-5 w-5" />
                    {loading ? 'Gerando...' : 'Gerar Certificado'}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Pronto para emisso</p>
                    <p className="text-xs text-slate-400">Certificado oficial e verificável</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    'Gera um documento com visual corporativo',
                    'Inclui conferência pública por código único',
                    'Facilita compartilhamento, impresso e download',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <p className="text-sm leading-6 text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Dica</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Após gerar, o usuário pode baixar, imprimir ou compartilhar sem sair da experiência.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Certificate Preview */}
              <div
                ref={certificateRef}
                className="relative overflow-hidden rounded-[2rem] p-6 mb-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.55)]"
                style={{
                  minHeight: '560px',
                  background: `linear-gradient(180deg, ${certificate.certificate_background_color || '#0f172a'} 0%, #0b1220 100%)`,
                  border: `1px solid ${certificate.certificate_border_color || '#f59e0b'}33`
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_26%)]" />
                {certificate.certificate_watermark_url && (
                  <img
                    src={certificate.certificate_watermark_url}
                    alt=""
                    className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 object-contain opacity-10"
                  />
                )}
                <div className="absolute left-0 top-0 h-28 w-28 rounded-br-[3rem] border-b border-r border-amber-400/20 bg-amber-400/10 blur-0" />
                <div className="absolute right-0 bottom-0 h-36 w-36 rounded-tl-[3rem] border-t border-l border-cyan-400/20 bg-cyan-400/10 blur-0" />

                <div className="relative h-full rounded-[1.75rem] border border-amber-400/25 bg-white/[0.06] p-8 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300">
                        <Award className="h-9 w-9" />
                        <span className="text-xs font-semibold uppercase tracking-[0.3em]">Certificado oficial</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
                        style={{ borderColor: `${getPaperAccent(paperType)}40`, color: getPaperAccent(paperType), backgroundColor: `${getPaperAccent(paperType)}12` }}>
                        Papel {paperType}
                      </div>
                      <h1 className="mt-4 text-3xl font-black tracking-[0.18em] text-white">
                        {certificate.certificate_title || 'CERTIFICADO DE CONCLUSO'}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                        {certificate.certificate_subtitle || 'Concedido ao participante que concluiu com êxito a avaliação e demonstrou domínio dos conteúdos aplicados.'}
                      </p>
                    </div>
                    <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right sm:block">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Verificao</p>
                      <p className="mt-1 font-mono text-xs text-amber-300 break-all">
                        {certificate.certificate_number || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-6">
                      {certificate.certificate_logo_url && (
                        <div className="mb-4">
                          <img src={certificate.certificate_logo_url} alt="Logo do certificado" className="h-12 w-12 rounded-xl object-contain" />
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Concedido a</p>
                      <h2 className="mt-3 text-4xl font-black text-white">
                        {certificate.user_name || 'Usuário'}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        Por completar com sucesso a avaliação <span className="font-semibold text-amber-300">{certificate.assessment_title || 'Avaliação'}</span>.
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Pontuação</p>
                          <p className="mt-2 text-2xl font-bold text-emerald-300">{certificate.score || 0}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Data</p>
                          <p className="mt-2 text-base font-semibold text-white">
                            {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('pt-BR') : ''}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">ID do certificado</p>
                          <p className="mt-2 font-mono text-sm text-slate-200 break-all">
                            {certificate.certificate_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <CheckCircle2 className="h-5 w-5" />
                          <p className="font-semibold">Validao ativa</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-200">
                          Este certificado pode ser conferido pelo link abaixo e usado como comprovao interna.
                        </p>
                        <p className="mt-4 break-all font-mono text-xs text-emerald-200">
                          {window.location.origin}/verify/{certificate.certificate_number}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Assinaturas</p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="h-14 border-b border-slate-500/50" />
                            <p className="mt-2 text-xs text-slate-300">Coordenao</p>
                          </div>
                          <div className="text-center">
                            <div className="h-14 border-b border-slate-500/50" />
                            <p className="mt-2 text-xs text-slate-300">{certificate.issuer_name || 'Qualidade'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Rodapé oficial</p>
                        <p className="mt-3 text-sm leading-6 text-slate-200">
                          {certificate.certificate_footer_text || 'Documento emitido automaticamente após aprovação da avaliação.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-white transition-colors hover:bg-slate-600"
                >
                  <Download className="w-5 h-5" />
                  Baixar
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-white transition-colors hover:bg-slate-600"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-white transition-colors hover:bg-slate-600"
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
