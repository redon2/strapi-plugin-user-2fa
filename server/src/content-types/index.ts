const mfa = {
  kind: 'collectionType',
  collectionName: 'mfa',
  info: {
    singularName: 'mfa',
    pluralName: 'mfas',
    displayName: 'MFA',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    userId: {
      type: 'integer',
    },
    secret: {
      type: 'string',
    },
  },
};
const mfaRegistration = {
  kind: 'collectionType',
  collectionName: 'mfa-registration',
  info: {
    singularName: 'mfa-registration',
    pluralName: 'mfa-registrations',
    displayName: 'MFA Registrations',
    description: '',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    enabled: {
      type: 'boolean',
      required: true,
      default: false,
    },
    type: {
      type: 'enumeration',
      enum: ['email', 'sms', 'google_authenticator'],
      required: true,
    },
    value: {
      type: 'string',
    }
  },
};
export default {
  mfa: { schema: mfa },
  'mfa-registration': {
    schema: mfaRegistration,
  },
};
