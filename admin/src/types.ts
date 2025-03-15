import { ListFieldLayout, ListLayout } from '@strapi/content-manager/strapi-admin';

export interface MFARegistration {
  id: number;
  type: string;
  enabled: boolean;
  value?: string;
  documentId: string;
}

export interface MFAModalSettingProps {
  setting: MFARegistration;
  updateSetting: (id: number, updatedSetting: Partial<MFARegistration>) => void;
}

export interface MFAConfigurationViewProps {
  slug: string;
}
export interface MFASettings {
  enabled: boolean;
  registrations: MFARegistration[];
}
export interface ModalDetailProps {
  mfaSettings: MFASettings;
  setModalOpen: Function;
  setMfaSettings: Function;
}

export interface AddColumnToTableHookArgs {
  layout: ListLayout;
  displayedHeaders: ListFieldLayout[];
}
export interface User {
  id: number;
  documentId: string;
  email: string;
}
