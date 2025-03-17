import { PERMISSIONS } from './constants';
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import addColumnToTableHook from './components/CustomColumn';
import disabledRegistrationsView from './components/DisabledRegistrationsView';
import { MFAConfigurationView } from './components/UserMFA';

export default {
  register(app: any) {
    app.registerHook('Admin/CM/pages/ListView/inject-column-in-table', addColumnToTableHook);
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
    app.registerHook('Admin/CM/pages/EditView/mutate-edit-view-layout', disabledRegistrationsView);

    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'MFA Config',
      Component: MFAConfigurationView,
    });
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: getTranslation('Settings.section-label'),
          defaultMessage: 'MFA plugin',
        },
      },
      [
        {
          intlLabel: {
            id: getTranslation('HeaderNav.link.emailTemplates'),
            defaultMessage: 'Email templates',
          },
          id: 'email-templates',
          to: `${PLUGIN_ID}/email-templates`,
          Component: () =>
            import('./pages/EmailTemplates').then((mod) => ({
              default: mod.ProtectedEmailTemplatesPage,
            })),
          permissions: PERMISSIONS.readEmailTemplates,
        },
      ]
    );
  },
  bootstrap(app: any) {},
  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
