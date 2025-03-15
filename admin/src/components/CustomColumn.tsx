import { useState, useEffect, useRef } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { Loader, Badge } from '@strapi/design-system';
import { AddColumnToTableHookArgs } from "../types";
import { getUserSettings } from '../api';

const Cell = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const fetchClient = useFetchClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!user || !user.id) return;
    // Simulate API call
    const fetchData = async () => {
      try {
        // Replace with actual API call
        const userSettings = await getUserSettings(fetchClient, user);
        setEnabled(userSettings.enabled);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return <Loader small>Loading...</Loader>;
  }

  if (enabled !== null) {
    return (
      <Badge
        backgroundColor={enabled ? 'success500' : 'danger600'}
        textColor='neutral0'
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  }

  return <Badge backgroundColor='danger500'>Not enabled</Badge>;
}

const addColumnToTableHook = (props: AddColumnToTableHookArgs) => {
  const { layout, displayedHeaders } = props;

  if (window.location.pathname.includes('/admin/content-manager/collection-types/plugin::users-permissions.user')) {

    return {
      displayedHeaders: [
        ...displayedHeaders,
        {
          attribute: { type: 'bool' },
          label: 'MFA Enabled',
          name: 'custom-column',
          searchable: false, sortable: false,
          cellFormatter: (props: any, _header: any, meta: any) => <Cell {...props} {...meta} />,
        }
      ],
      layout
    };
  }

  return {
    displayedHeaders,
    layout,
  };
};

export default addColumnToTableHook;