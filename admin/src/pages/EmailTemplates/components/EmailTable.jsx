import * as React from 'react';

import {
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  VisuallyHidden,
  Box,
} from '@strapi/design-system';
import { Check, Pencil, ArrowClockwise as Refresh, Mail } from '@strapi/icons';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../../utils/getTranslation';

const ICON_MAP = {
  check: Check,
  pencil: Pencil,
  sync: Refresh,
  envelope: Mail,
};

const IconRenderer = ({ name, size = '1.5rem', color = 'currentColor' }) => {
  const IconComponent = ICON_MAP[name] || Check; // Default to Check icon if invalid name
  return <IconComponent width={size} height={size} color={color} />;
};


const EmailTable = ({ canUpdate, onEditClick, emailTemplates }) => {

  const templateArray = Object.values(emailTemplates);
  const templateKeys = Object.keys(emailTemplates);

  const { formatMessage } = useIntl();

  console.log(templateArray, templateKeys);

  return (
    <Table colCount={3} rowCount={3}>
      <Thead>
        <Tr>
          <Th width="1%">
            <VisuallyHidden>
              {formatMessage({
                id: getTranslation('Email.template.table.icon.label'),
                defaultMessage: 'icon',
              })}
            </VisuallyHidden>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({
                id: getTranslation('Email.template.table.name.label'),
                defaultMessage: 'name',
              })}
            </Typography>
          </Th>
          <Th width="1%">
            <VisuallyHidden>
              {formatMessage({
                id: getTranslation('Email.template.table.action.label'),
                defaultMessage: 'action',
              })}
            </VisuallyHidden>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {templateArray.map((template, key) => (
          <Tr key={template.id} cursor="pointer" onClick={() => onEditClick(templateKeys[key])} index={key}>
            <Td>
              <Box width="3.2rem" height="3.2rem" padding="0.8rem">
                <IconRenderer name={template.icon} />
              </Box>
            </Td>
            <Td>
              <Typography>{formatMessage({
                id: getTranslation(`${template.display}.display`),
                defaultMessage: 'Email Template',
              })}</Typography>
            </Td>
            <Td onClick={(e) => e.stopPropagation()}>
              <IconButton
                onClick={() => onEditClick(templateKeys[key])}
                withTooltip={false}
                label={formatMessage({
                  id: getTranslation('Email.template.form.edit.label'),
                  defaultMessage: 'Edit a template',
                })}
                variant="ghost"
                disabled={!canUpdate}
              >
                <Pencil />
              </IconButton>
            </Td>
          </Tr>
        ))}

        {/* <Tr cursor="pointer" onClick={() => onEditClick('reset_password')}>
          <Td>
            <Box width="3.2rem" height="3.2rem" padding="0.8rem">
              <Refresh
                aria-label={formatMessage({
                  id: 'global.reset-password',
                  defaultMessage: 'Reset password',
                })}
              />
            </Box>
          </Td>
          <Td>
            <Typography>
              {formatMessage({
                id: 'global.reset-password',
                defaultMessage: 'Reset password',
              })}
            </Typography>
          </Td>
          <Td onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => onEditClick('reset_password')}
              withTooltip={false}
              label={formatMessage({
                id: getTranslation('Email.template.form.edit.label'),
                defaultMessage: 'Edit a template',
              })}
              variant="ghost"
              disabled={!canUpdate}
            >
              <Pencil />
            </IconButton>
          </Td>
        </Tr>
        <Tr cursor="pointer" onClick={() => onEditClick('email_confirmation')}>
          <Td>
            <Box width="3.2rem" height="3.2rem" padding="0.8rem">
              <Check
                aria-label={formatMessage({
                  id: getTranslation('Email.template.email_confirmation'),
                  defaultMessage: 'Email address confirmation',
                })}
              />
            </Box>
          </Td>
          <Td>
            <Typography>
              {formatMessage({
                id: getTranslation('Email.template.email_confirmation'),
                defaultMessage: 'Email address confirmation',
              })}
            </Typography>
          </Td>
          <Td onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => onEditClick('email_confirmation')}
              label={formatMessage({
                id: getTranslation('Email.template.form.edit.label'),
                defaultMessage: 'Edit a template',
              })}
              variant="ghost"
              disabled={!canUpdate}
            >
              <Pencil />
            </IconButton>
          </Td>
        </Tr> */}
      </Tbody>
    </Table>
  );
};

EmailTable.propTypes = {
  canUpdate: PropTypes.bool.isRequired,
  onEditClick: PropTypes.func.isRequired,
  emailTemplates: PropTypes.object.isRequired
};

export default EmailTable;
