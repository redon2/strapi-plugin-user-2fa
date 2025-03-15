import { PLUGIN_ID } from '../pluginId';
import { MFARegistration, MFASettings, User } from 'src/types';
interface FetchClient {
  get: (url: string) => Promise<any>;
  post: (url: string, data: any) => Promise<any>;
  put: (url: string, data: any) => Promise<any>;
}

const getUserSettings = async (fetchClient: FetchClient, user: User): Promise<MFASettings> => {
  const { get } = fetchClient;
  const response = await get(`/${PLUGIN_ID}/user-mfa-status/${user.id}`);
  return response.data;
};

const updateMfaRegistration = async (fetchClient: FetchClient, props: MFARegistration) => {
  const { put } = fetchClient;
  const response = await put(`/${PLUGIN_ID}/user-mfa-registration/${props.documentId}`, {
    data: props,
  });
  return Promise.resolve(true);
};
const createMfaRegistration = async (fetchClient: FetchClient, user: User) => {
  const { post } = fetchClient;
  const payload = {
    enabled: true,
    type: 'email',
    value: user.email,
    user: user.documentId,
  };
  const response = await post(`/${PLUGIN_ID}/user-mfa-activate/${user.documentId}`, {
    data: payload,
  });
  return Promise.resolve(true);
};

export { getUserSettings, updateMfaRegistration, createMfaRegistration };
