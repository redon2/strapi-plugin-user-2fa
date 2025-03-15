
import { ListFieldLayout, ListLayout, } from '@strapi/content-manager/strapi-admin';

interface AddColumnToTableHookArgs {
    layout: ListLayout
}

const disabledRegistrationsView = (props: AddColumnToTableHookArgs) => {
    const { layout } = props;
    if (window.location.pathname.includes('/admin/content-manager/collection-types/plugin::user-2fa.mfa-registration/')) {
        layout.layout.forEach((field: any) => {
            field.forEach((f: any) => {
                f.forEach((ff: any) => {
                    if (ff.name !== 'enabled')
                        ff.disabled = true

                });
            });

        });
    }

    return {
        layout,
    };
}

export default disabledRegistrationsView;