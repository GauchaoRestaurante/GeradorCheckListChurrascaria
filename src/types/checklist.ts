export type ItemType = 'photo' | 'simple';
export type ImageFitMode = 'contain' | 'cover';
export type ItemAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | 'auto';
export type ItemLayoutSpan = 1 | 2;

export interface ChecklistItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  checked?: boolean;
  type?: ItemType; // 'photo' (padrão com foto) ou 'simple' (apenas assinalar à caneta)
  layoutSpan?: ItemLayoutSpan; // 1 (padrão) ou 2 (destaque grande, ocupa o espaço de 2 itens)
  aspectRatio?: ItemAspectRatio; // '1:1' | '16:9' | '9:16' | '4:3' | 'auto'
  imageFit?: ImageFitMode; // 'contain' ou 'cover'
}

export type ColumnCount = 2 | 3;
export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type PhotoSizeOption = 'sm' | 'md' | 'lg';
export type ItemSpacingOption = 'compact' | 'balanced' | 'spacious';
export type CheckboxStyle = 'standard' | 'large' | 'conforming';

export interface HeaderFieldsConfig {
  showDate?: boolean;
  dateLabel?: string;
  showInspector?: boolean;
  inspectorLabel?: string;
  showSignature?: boolean;
  signatureLabel?: string;
  showLocation?: boolean;
  locationLabel?: string;
}

export interface HeaderSignBoxConfig {
  show: boolean; // Se exibe o quadro compacto no canto direito
  dateLabel?: string; // default: "DATA:"
  signatureLabel?: string; // default: "ASSINATURA:"
}

export interface ChecklistConfig {
  id: string;
  title: string;
  subtitle: string;
  companyLogoUrl?: string;
  showCompanyLogo?: boolean;
  companyName?: string;
  showCompanyName?: boolean;
  columns: ColumnCount;
  fontSize: FontSizeOption;
  photoSize: PhotoSizeOption;
  imageFitMode?: ImageFitMode; // 'contain' (ajuste proporcional) ou 'cover'
  itemSpacing: ItemSpacingOption;
  checkboxStyle: CheckboxStyle;
  showItemNumbers: boolean;
  highContrast: boolean;
  // Quadro compacto no canto superior direito (DATA + ASSINATURA)
  headerSignBox?: HeaderSignBoxConfig;
  showSimpleSection?: boolean;
  simpleSectionTitle?: string;
  simpleColumns?: 1 | 2 | 3;
  showNotesArea: boolean;
  notesTitle: string;
  notesLines: number;
  headerFields?: HeaderFieldsConfig;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}
