import * as React from 'react';
import { useTracking } from '@strapi/admin/strapi-admin';
import { useNotifyAT } from '@strapi/design-system';
import {
  Page,
  useAPIErrorHandler,
  useNotification,
  useFetchClient,
  useRBAC,
  Layouts,
} from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';

import { PERMISSIONS } from '../../constants';
import { getTranslation } from '../../utils/getTranslation';

import EmailForm from './components/EmailForm';
import EmailTable from './components/EmailTable'; // Ensure this is now a `.tsx` file

const queryClient = new QueryClient();

// ✅ Define TypeScript types for email templates
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  options?: {
    message_html?: string;
  };
}

// ✅ Define TypeScript types for props
interface EmailTemplatesData {
  [key: string]: EmailTemplate;
}

const ProtectedEmailTemplatesPage: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Page.Protect permissions={PERMISSIONS.readEmailTemplates}>
      <EmailTemplatesPage />
    </Page.Protect>
  </QueryClientProvider>
);

const EmailTemplatesPage: React.FC = () => {
  const { formatMessage } = useIntl();
  const { trackUsage } = useTracking();
  const { notifyStatus } = useNotifyAT();
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const { get, put } = useFetchClient();
  const { formatAPIError } = useAPIErrorHandler();

  // ✅ Use correct types for state variables
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [templateToEdit, setTemplateToEdit] = React.useState<string | null>(null);

  // ✅ Correctly type the useRBAC hook
  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canUpdate },
  } = useRBAC({ update: PERMISSIONS.updateEmailTemplates });

  // ✅ Fetch email templates with proper typing
  const { isLoading: isLoadingData, data } = useQuery<EmailTemplatesData>(
    ['users-permissions', 'email-templates'],
    async () => {
      const response = await get('/users-permissions/email-templates');
      return response.data;
    },
    {
      onSuccess() {
        notifyStatus(
          formatMessage({
            id: getTranslation('Email.template.data.loaded'),
            defaultMessage: 'Email templates have been loaded',
          })
        );
      },
      onError(error) {
        toggleNotification({
          type: 'danger',
          message: formatAPIError(error as any),
        });
      },
    }
  );

  const isLoading = isLoadingForPermissions || isLoadingData;

  // ✅ Function type: toggle modal
  const handleToggle = (): void => {
    setIsModalOpen((prev) => !prev);
  };

  // ✅ Function type: handle editing
  const handleEditClick = (templateId: string): void => {
    setTemplateToEdit(templateId);
    handleToggle();
  };

  // ✅ Mutate email templates with proper TypeScript type
  const submitMutation = useMutation(
    (body: EmailTemplatesData) => put('/users-permissions/email-templates', { 'email-templates': body }),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['users-permissions', 'email-templates']);

        toggleNotification({
          type: 'success',
          message: formatMessage({ id: 'notification.success.saved', defaultMessage: 'Saved' }),
        });

        trackUsage('didEditEmailTemplates');
        handleToggle();
      },
      onError(error) {
        toggleNotification({
          type: 'danger',
          message: formatAPIError(error as any),
        });
      },
    }
  );

  // ✅ Function type: handle submission
  const handleSubmit = (body: EmailTemplate): void => {
    trackUsage('willEditEmailTemplates');

    if (!data || !templateToEdit || !data[templateToEdit]) return;

    const editedTemplates: EmailTemplatesData = {
      ...data,
      [templateToEdit]: { ...body, id: templateToEdit } // ✅ Ensure `id` is included
    };

    submitMutation.mutate(editedTemplates);
  };

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main aria-busy={submitMutation.isLoading}>
      <Page.Title>
        {formatMessage(
          { id: 'Settings.PageTitle', defaultMessage: 'Settings - {name}' },
          {
            name: formatMessage({
              id: getTranslation('HeaderNav.link.emailTemplates'),
              defaultMessage: 'Email templates',
            }),
          }
        )}
      </Page.Title>
      <Layouts.Header
        title={formatMessage({
          id: getTranslation('HeaderNav.link.emailTemplates'),
          defaultMessage: 'Email templates',
        })}
      />
      <Layouts.Content>
        <EmailTable onEditClick={handleEditClick} canUpdate={canUpdate} emailTemplates={data ?? {}} />
        {templateToEdit && (
          <EmailForm
            template={data?.[templateToEdit] ?? ({ id: '', name: '', subject: '', message: '' } as EmailTemplate)}
            onToggle={handleToggle}
            open={isModalOpen}
            onSubmit={handleSubmit}
          />
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

export { ProtectedEmailTemplatesPage, EmailTemplatesPage };
