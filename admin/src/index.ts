import React from 'react';
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import addColumnToTableHook from './components/CustomColumn';
import disabledRegistrationsView from './components/DisabledRegristrationsView';
import { MFAConfigurationView } from './components/UserMFA';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });
    app.registerHook('Admin/CM/pages/ListView/inject-column-in-table', addColumnToTableHook);
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
    app.registerHook("Admin/CM/pages/EditView/mutate-edit-view-layout", disabledRegistrationsView);

    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'MFA Config',
      Component: MFAConfigurationView,
    });
  },
  bootstrap(app: any) {
    app.getPlugin('content-manager').injectComponent('editView', 'informations', {
      name: 'my-plugin-my-compo',
      Component: React.createElement(React.Fragment, null, 'My component'),
    });
  },
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
