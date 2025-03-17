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
import { useIntl } from 'react-intl';

import { getTranslation } from '../../../utils/getTranslation';

// ✅ Define allowed icon names
type IconName = 'check' | 'pencil' | 'sync' | 'envelope';

// ✅ Map icon names to Strapi icons
const ICON_MAP: Record<IconName, React.ElementType> = {
  check: Check,
  pencil: Pencil,
  sync: Refresh,
  envelope: Mail,
};

// ✅ Props for the IconRenderer component
interface IconRendererProps {
  name: IconName;
  size?: string;
  color?: string;
}

// ✅ Component to render an icon dynamically
const IconRenderer: React.FC<IconRendererProps> = ({ name, size = '1.5rem', color = 'currentColor' }) => {
  const IconComponent = ICON_MAP[name] || Check; // Default to Check icon if invalid name
  return <IconComponent width={size} height={size} color={color} />;
};

// ✅ Define TypeScript interface for an email template
interface EmailTemplate {
  id?: string;
  name?: string;
  subject?: string;
  message?: string;
  options?: {
    message_html?: string;
  };
}

// ✅ Define props for EmailTable component
interface EmailTableProps {
  canUpdate: boolean;
  onEditClick: (templateId: string) => void;
  emailTemplates: EmailTemplate; // Object where keys are template IDs
}

const EmailTable: React.FC<EmailTableProps> = ({ canUpdate, onEditClick, emailTemplates }) => {
  const { formatMessage } = useIntl();

  // Convert emailTemplates object into an array
  const templateArray = Object.values(emailTemplates);
  const templateKeys = Object.keys(emailTemplates);

  return (
    <Table colCount={3} rowCount={templateArray.length}>
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
        {templateArray.map((template, index) => (
          <Tr key={templateKeys[index] || `template-${index}`} cursor="pointer" onClick={() => onEditClick(templateKeys[index])} index={index}>
            <Td>
              <Box width="3.2rem" height="3.2rem" padding="0.8rem">
                <IconRenderer name={template.icon} />
              </Box>
            </Td>
            <Td>
              <Typography>
                {formatMessage({
                  id: getTranslation(`${template.display}.display`),
                  defaultMessage: 'Email Template',
                })}
              </Typography>
            </Td>
            <Td onClick={(e: any) => e.stopPropagation()}>
              <IconButton
                onClick={() => onEditClick(templateKeys[index])}
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
      </Tbody>
    </Table>
  );
};

export default EmailTable;
