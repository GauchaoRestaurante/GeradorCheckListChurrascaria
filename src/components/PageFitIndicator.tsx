import React from 'react';
import { ChecklistConfig } from '../types/checklist';
import { Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface PageFitIndicatorProps {
  config: ChecklistConfig;
  onAutoFit: () => void;
  onForce6Rows?: () => void;
}

export function calculateA4Fit(config: ChecklistConfig): {
  occupancyPercent: number;
  status: 'optimal' | 'underfilled' | 'overflow';
  message: string;
  recommendation?: string;
} {
  const { items, columns, fontSize, photoSize, itemSpacing, showNotesArea, notesLines } = config;

  // Altura útil de 1 página A4: ~270mm (após margens de 4mm a 6mm)
  // Cabeçalho compacto: ~16mm base + ~8mm se tiver logotipo/empresa.
  let headerHeightMm = 16;
  if (config.showCompanyLogo || config.showCompanyName) {
    headerHeightMm += 8;
  }

  // Rodapé (Observações): se desligado economiza espaço valioso; se ligado: ~7mm base + ~5mm por linha
  let footerHeightMm = 0;
  if (showNotesArea) {
    footerHeightMm = 7 + notesLines * 5;
  }

  const photoItems = items.filter((item) => (item.type || 'photo') === 'photo');
  const simpleItems = items.filter((item) => item.type === 'simple');

  // Altura dos itens com foto em mm (calibrada para 2 ou 3 colunas)
  const isThreeCols = columns === 3;
  const photoHeightsMm = isThreeCols
    ? { sm: 18, md: 22, lg: 26 }[photoSize]
    : { sm: 28, md: 36, lg: 41 }[photoSize];
  const spacingMm = { compact: 2, balanced: 3.5, spacious: 5.5 }[itemSpacing];

  const photoItemHeightMm = photoHeightsMm + (itemSpacing === 'compact' ? 3 : 5);
  const photoRowsCount = photoItems.length > 0 ? Math.ceil(photoItems.length / columns) : 0;
  const totalPhotoHeightMm = photoRowsCount * photoItemHeightMm;

  // Altura dos itens sem foto (bloco rápido de assinalar à caneta)
  const simpleCols = config.simpleColumns || 2;
  const simpleRowsCount = simpleItems.length > 0 ? Math.ceil(simpleItems.length / simpleCols) : 0;
  const simpleItemHeightMm = 8 + (fontSize === 'xl' ? 2 : fontSize === 'lg' ? 1 : 0);
  const totalSimpleHeightMm = simpleItems.length > 0 ? 7 + simpleRowsCount * simpleItemHeightMm : 0;

  const totalItemsHeightMm = totalPhotoHeightMm + totalSimpleHeightMm;

  const totalUsedHeightMm = headerHeightMm + totalItemsHeightMm + footerHeightMm;
  const availableHeightMm = 270; // A4 útil portrait

  const occupancyPercent = Math.round((totalUsedHeightMm / availableHeightMm) * 100);

  if (occupancyPercent > 102) {
    return {
      occupancyPercent,
      status: 'overflow',
      message: `Atenção: Conteúdo ultrapassa 1 página A4 (${occupancyPercent}%).`,
      recommendation: photoRowsCount >= 6 && columns === 2
        ? 'Dica: Clique no botão "Forçar 6 Linhas" para calibrar fotos e remover observações para caber em 1 página.'
        : columns === 2 && photoItems.length > 12 
        ? 'Mude para 3 colunas ou clique em "Auto-Ajustar para 1 Página".' 
        : 'Reduza o tamanho da foto/texto ou diminua o espaçamento.',
    };
  } else if (occupancyPercent >= 75) {
    const is6RowsFitted = photoRowsCount === 6 && columns === 2;
    return {
      occupancyPercent,
      status: 'optimal',
      message: is6RowsFitted 
        ? `Encaixe Ideal: 6 Linhas em 1 Página A4 (${occupancyPercent}% preenchido).`
        : `Encaixe Ideal: 1 Página A4 (${occupancyPercent}% de aproveitamento).`,
      recommendation: is6RowsFitted
        ? '6 linhas perfeitamente calibradas com fotos visíveis, sem corte e sem gerar 2ª página.'
        : 'Todas as fotos e textos estão dimensionados para caber perfeitamente na folha.',
    };
  } else {
    return {
      occupancyPercent,
      status: 'underfilled',
      message: `Espaço Sobrando na Folha A4 (${occupancyPercent}% preenchido).`,
      recommendation: 'Você pode adicionar mais itens ou aumentar o tamanho das fotos e fontes.',
    };
  }
}

export const PageFitIndicator: React.FC<PageFitIndicatorProps> = ({ config, onAutoFit, onForce6Rows }) => {
  const { occupancyPercent, status, message, recommendation } = calculateA4Fit(config);

  const statusConfig = {
    optimal: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      barColor: 'bg-emerald-500',
    },
    underfilled: {
      color: 'text-sky-800 bg-sky-50 border-sky-200',
      icon: <Layers className="w-4 h-4 text-sky-600 shrink-0" />,
      barColor: 'bg-sky-500',
    },
    overflow: {
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      barColor: 'bg-amber-500',
    },
  }[status];

  return (
    <div className={`rounded-xl border p-3 ${statusConfig.color} transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2">
          {statusConfig.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{message}</span>
            </div>
            {recommendation && (
              <p className="text-[11px] opacity-85 mt-0.5 leading-snug">
                {recommendation}
              </p>
            )}
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onForce6Rows && (
            <button
              onClick={onForce6Rows}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg shadow-2xs transition-all active:scale-98"
              title="Forçar 6 linhas completas (12 itens) em 1 página sacrificando o rodapé de observação"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
              Forçar 6 Linhas
            </button>
          )}

          <button
            onClick={onAutoFit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-98"
            title="Recalcula espaçamentos e tamanhos para encaixar com precisão em exatamente 1 página A4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Auto-Ajustar
          </button>
        </div>
      </div>

      {/* Barra de progresso da página A4 */}
      <div className="mt-2.5">
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${statusConfig.barColor}`}
            style={{ width: `${Math.min(100, occupancyPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
