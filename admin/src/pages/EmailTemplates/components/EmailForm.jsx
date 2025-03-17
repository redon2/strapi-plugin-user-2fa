import * as React from 'react';

import { Button, Grid, Modal, Breadcrumbs, Crumb, VisuallyHidden } from '@strapi/design-system';
import { Form, InputRenderer } from '@strapi/strapi/admin';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../../utils/getTranslation';
import schema from '../utils/schema';

const EmailForm = ({ template = {}, onToggle, open, onSubmit }) => {
  const { formatMessage } = useIntl();

  return (
    <Modal.Root open={open} onOpenChange={onToggle}>
      <Modal.Content>
        <Modal.Header>
          <Breadcrumbs
            label={`${formatMessage({
              id: getTranslation('PopUpForm.header.edit.email-templates'),
              defaultMessage: 'Edit email template',
            })}, ${template.display
              ? formatMessage({
                id: getTranslation(template.display),
                defaultMessage: template.display,
              })
              : ''
              }`}
          >
            <Crumb>
              {formatMessage({
                id: getTranslation('PopUpForm.header.edit.email-templates'),
                defaultMessage: 'Edit email template',
              })}
            </Crumb>
            <Crumb isCurrent>
              {template.display
                ? formatMessage({ id: getTranslation(`${template.display}.display`), defaultMessage: template.display })
                : ''}
            </Crumb>
          </Breadcrumbs>
          <VisuallyHidden>
            <Modal.Title>
              {`${formatMessage({
                id: getTranslation('PopUpForm.header.edit.email-templates'),
                defaultMessage: 'Edit email template',
              })}, ${template.display ? formatMessage({ id: getTranslation(template.display), defaultMessage: template.display }) : ''}`}
            </Modal.Title>
          </VisuallyHidden>
        </Modal.Header>
        <Form onSubmit={onSubmit} initialValues={template} validationSchema={schema}>
          {({ isSubmitting }) => {
            console.log(template);
            const htmlMessage = template.options.message_html ?
              {
                label: formatMessage({
                  id: getTranslation('PopUpForm.Email.options.message.label'),
                  defaultMessage: 'Message HTML',
                }),
                name: 'options.message_html',
                size: 12,
                type: 'text',

              }
              : {
                visibility: 'hidden'
              };

            return (
              <>
                <Modal.Body>
                  <Grid.Root gap={5}>
                    {[
                      {
                        label: formatMessage({
                          id: getTranslation('PopUpForm.Email.options.from.name.label'),
                          defaultMessage: 'Shipper name',
                        }),
                        name: 'options.from.name',
                        size: 6,
                        type: 'string',
                      },
                      {
                        label: formatMessage({
                          id: getTranslation('PopUpForm.Email.options.from.email.label'),
                          defaultMessage: 'Shipper email',
                        }),
                        name: 'options.from.email',
                        size: 6,
                        type: 'string',
                      },
                      {
                        label: formatMessage({
                          id: getTranslation('PopUpForm.Email.options.response_email.label'),
                          defaultMessage: 'Response email',
                        }),
                        name: 'options.response_email',
                        size: 6,
                        type: 'string',
                      },
                      {
                        label: formatMessage({
                          id: getTranslation('PopUpForm.Email.options.object.label'),
                          defaultMessage: 'Subject',
                        }),
                        name: 'options.object',
                        size: 6,
                        type: 'string',
                      },
                      {
                        label: formatMessage({
                          id: getTranslation('PopUpForm.Email.options.message.label'),
                          defaultMessage: 'Message Plain',
                        }),
                        name: 'options.message',
                        size: 12,
                        type: 'text',
                        'border-radius': 0,

                      },
                      htmlMessage

                    ].map(({ size, ...field }) => (
                      <Grid.Item
                        key={field.name}
                        col={size}
                        direction="column"
                        alignItems="stretch"
                      >
                        <InputRenderer {...field} />
                      </Grid.Item>
                    ))}
                  </Grid.Root>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close>
                    <Button variant="tertiary">Cancel</Button>
                  </Modal.Close>
                  <Button loading={isSubmitting} type="submit">
                    Finish
                  </Button>
                </Modal.Footer>
              </>
            );
          }}
        </Form>
      </Modal.Content>
    </Modal.Root>
  );
};

EmailForm.defaultProps = {
  template: {},
};

EmailForm.propTypes = {
  template: PropTypes.shape({
    display: PropTypes.string,
    icon: PropTypes.string,
    options: PropTypes.shape({
      from: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      message: PropTypes.string,
      object: PropTypes.string,
      response_email: PropTypes.string,
    }),
  }),
  open: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default EmailForm;
