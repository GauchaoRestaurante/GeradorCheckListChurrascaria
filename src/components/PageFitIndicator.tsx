import React from 'react';
import { ChecklistConfig } from '../types/checklist';
import { Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface PageFitIndicatorProps {
  config: ChecklistConfig;
  onAutoFit: () => void;
}

export function calculateA4Fit(config: ChecklistConfig): {
  occupancyPercent: number;
  status: 'optimal' | 'underfilled' | 'overflow';
  message: string;
  recommendation?: string;
} {
  const { items, columns, fontSize, photoSize, itemSpacing, showNotesArea, notesLines, headerFields } = config;

  // Altura útil de 1 página A4: ~270mm (após margens de 6mm a 8mm)
  // Cabeçalho compacto: ~16mm base + ~9mm se tiver logotipo/empresa.
  // O quadro de Data/Assinatura fica ao lado do título, economizando uma linha inteira de altura!
  let headerHeightMm = 16;
  if (config.showCompanyLogo || config.showCompanyName) {
    headerHeightMm += 9;
  }

  // Rodapé (Observações): se desligado economiza espaço valioso; se ligado: ~8mm base + ~5mm por linha
  let footerHeightMm = 0;
  if (showNotesArea) {
    footerHeightMm = 8 + notesLines * 5;
  }

  const photoItems = items.filter((item) => (item.type || 'photo') === 'photo');
  const simpleItems = items.filter((item) => item.type === 'simple');

  // Altura dos itens com foto em mm (calibrada para 2 ou 3 colunas)
  const isThreeCols = columns === 3;
  const photoHeightsMm = isThreeCols
    ? { sm: 10, md: 13, lg: 16 }[photoSize]
    : { sm: 14, md: 18, lg: 22 }[photoSize];
  const fontHeightsMm = isThreeCols
    ? { sm: 3.5, base: 4.5, lg: 5.5, xl: 6.5 }[fontSize]
    : { sm: 4, base: 5, lg: 6.5, xl: 8 }[fontSize];
  const spacingMm = { compact: 2, balanced: 3.5, spacious: 5.5 }[itemSpacing];

  const photoItemHeightMm = Math.max(photoHeightsMm, fontHeightsMm * 2) + spacingMm + 2;
  const photoRowsCount = photoItems.length > 0 ? Math.ceil(photoItems.length / columns) : 0;
  const totalPhotoHeightMm = photoRowsCount * photoItemHeightMm;

  // Altura dos itens sem foto (bloco rápido de assinalar à caneta)
  const simpleCols = config.simpleColumns || 2;
  const simpleRowsCount = simpleItems.length > 0 ? Math.ceil(simpleItems.length / simpleCols) : 0;
  const simpleItemHeightMm = 8 + (fontSize === 'xl' ? 2 : fontSize === 'lg' ? 1 : 0);
  const totalSimpleHeightMm = simpleItems.length > 0 ? 7 + simpleRowsCount * simpleItemHeightMm : 0;

  const totalItemsHeightMm = totalPhotoHeightMm + totalSimpleHeightMm;

  const totalUsedHeightMm = headerHeightMm + totalItemsHeightMm + footerHeightMm;
  const availableHeightMm = 265; // A4 útil portrait

  const occupancyPercent = Math.round((totalUsedHeightMm / availableHeightMm) * 100);

  if (occupancyPercent > 102) {
    return {
      occupancyPercent,
      status: 'overflow',
      message: `Atenção: Conteúdo ultrapassa 1 página A4 (${occupancyPercent}%).`,
      recommendation: columns === 2 && photoItems.length > 12 
        ? 'Mude para 3 colunas ou clique em "Auto-Ajustar para 1 Página".' 
        : 'Reduza o tamanho da foto/texto ou diminua o espaçamento.',
    };
  } else if (occupancyPercent >= 75) {
    return {
      occupancyPercent,
      status: 'optimal',
      message: `Encaixe Ideal: 1 Página A4 (${occupancyPercent}% de aproveitamento).`,
      recommendation: 'Todas as fotos e textos estão dimensionados para caber perfeitamente na folha.',
    };
  } else {
    return {
      occupancyPercent,
      status: 'underfilled',
      message: `Espaço Sobrando na Folha A4 (${occupancyPercent}% preenchido).`,
      recommendation: 'Você pode aumentar o tamanho das fotos e da fonte para facilitar a leitura.',
    };
  }
}

export const PageFitIndicator: React.FC<PageFitIndicatorProps> = ({ config, onAutoFit }) => {
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

        {/* Botão de Auto-Ajuste com 1 clique */}
        <button
          onClick={onAutoFit}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100 hover:border-slate-400 transition-all shrink-0 active:scale-98"
          title="Recalcula espaçamentos e tamanhos para encaixar com precisão em exatamente 1 página A4"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Auto-Ajustar para 1 Página A4
        </button>
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
