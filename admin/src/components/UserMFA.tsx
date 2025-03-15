import { Badge, Button, Typography, Flex, Modal, Grid, Toggle, Field, TextInput } from "@strapi/design-system";
import { Mail } from '@strapi/icons';
import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext, unstable_useDocument } from '@strapi/strapi/admin';
import { getUserSettings, updateMfaRegistration, createMfaRegistration } from '../api';
import { useState, useEffect } from 'react';
import { MFAModalSettingProps, ModalDetailProps, MFARegistration, MFAConfigurationViewProps, User } from '../types';

const MFAModalSetting: React.FC<MFAModalSettingProps> = ({ setting, updateSetting }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        updateSetting(setting.id, { enabled: isChecked });
    };

    return (
        <Flex
            tag="aside"
            aria-labelledby="additional-information"
            background="neutral0"
            borderColor="neutral150"
            padding={4}
            gap={3}
            direction="column"
            width="100%"
            alignItems="flex-start"
        >
            <Typography tag="h2" variant="sigma" textTransform="uppercase" textColor="neutral600">
                {setting?.type || '...'}
            </Typography>
            <Grid.Root width="100%">
                <Grid.Item col={6} s={12}><Typography>Status</Typography></Grid.Item>
                <Grid.Item col={6} s={12} justifyContent="right">
                    <Field.Root width="100%">
                        <Toggle
                            onLabel="True"
                            offLabel="False"
                            checked={setting.enabled}
                            onChange={handleChange}
                        />
                    </Field.Root>
                </Grid.Item>
            </Grid.Root>
            <Grid.Root width="100%">
                <Grid.Item col={6} s={12}><Typography>Value</Typography></Grid.Item>
                <Grid.Item col={6} s={12} justifyContent="right">
                    <Field.Root width="100%">
                        <TextInput size="M" type="text" disabled value={setting.value || ''} />
                    </Field.Root>
                </Grid.Item>
            </Grid.Root>
        </Flex>
    );
};

const ModalDetail: React.FC<ModalDetailProps> = ({ mfaSettings, setMfaSettings, setModalOpen }) => {
    const fetchClient = useFetchClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState<MFARegistration[]>(mfaSettings.registrations);

    const updateSetting = (id: number, updatedSetting: Partial<MFARegistration>) => {
        setSettings((prevSettings) =>
            prevSettings.map((s) => (s.id === id ? { ...s, ...updatedSetting } : s))
        );
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            await Promise.all(settings.map((setting) => updateMfaRegistration(fetchClient, setting)));

        } catch (error) {
            console.error("Error updating MFA settings", error);
        } finally {
            setIsSubmitting(false);
            const isEnabled = settings.some((reg) => reg.enabled === true);
            setModalOpen(false);
            setMfaSettings({ enabled: isEnabled, registrations: settings });

        }
    };

    return (
        <Modal.Content>
            <Modal.Header>
                <Modal.Title>MFA Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {settings.map((item) => (
                    <MFAModalSetting key={item.id} setting={item} updateSetting={updateSetting} />
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Modal.Close>
                    <Button variant="tertiary">Cancel</Button>
                </Modal.Close>
                <Button loading={isSubmitting} disabled={isSubmitting} onClick={onSubmit}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal.Content>
    );
};

const MfaSection: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [mfaSettings, setMfaSettings] = useState<{ enabled: boolean; registrations: MFARegistration[] }>({
        enabled: false,
        registrations: [],
    });

    const fetchClient = useFetchClient();
    const data = useContentManagerContext();
    const { document } = unstable_useDocument({
        documentId: data.id,
        model: data.model,
        collectionType: data.collectionType,
    });

    const enableMfaForUser = () => {
        createMfaRegistration(fetchClient, user);
        console.log(document)
    };

    const user: User | undefined = document as User | undefined;

    useEffect(() => {
        if (!user || !user.id) return;

        const fetchData = async () => {
            try {
                const settings = await getUserSettings(fetchClient, user);
                setMfaSettings(settings);
            } catch (error) {
                console.error('Error fetching data', error, user);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <Flex
            tag="aside"
            aria-labelledby="additional-information"
            background="neutral0"
            borderColor="neutral150"
            padding={4}
            gap={3}
            direction="column"
            width="100%"
            alignItems="flex-start"
        >
            <Typography tag="h2" variant="sigma" textTransform="uppercase" textColor="neutral600">
                MFA Settings
            </Typography>
            {loading ? (
                <>Loading...</>
            ) : (
                <>
                    <Flex direction="row" gap={4} alignItems="center">
                        <Flex direction="column" alignItems="flex-start">
                            <Typography fontWeight="bold">Status:</Typography>
                            <Badge
                                backgroundColor={mfaSettings.enabled ? 'success500' : 'danger600'}
                                textColor="neutral0"
                            >
                                {mfaSettings.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </Flex>
                        <Flex direction="column" alignItems="flex-start">
                            <Typography fontWeight="bold">Type:</Typography>
                            <Badge>
                                <Flex alignItems="center" gap={1}>
                                    <Mail />
                                    Email
                                </Flex>
                            </Badge>
                        </Flex>
                    </Flex>
                    <Modal.Root open={modalOpen} onOpenChange={setModalOpen}>
                        {mfaSettings.registrations.length == 0 ?
                            <Button color="primary" variant="primary" onClick={enableMfaForUser} >
                                Enable
                            </Button>
                            :
                            <Modal.Trigger>
                                <Button color="primary" variant="primary">
                                    Change
                                </Button>
                            </Modal.Trigger>
                        }
                        <ModalDetail mfaSettings={mfaSettings} setMfaSettings={setMfaSettings} open={modalOpen} setModalOpen={setModalOpen} />
                    </Modal.Root>
                </>
            )}
        </Flex>
    );
};

const MFAConfigurationView: React.FC<MFAConfigurationViewProps> = ({ slug }) => {
    if (slug === 'plugin::users-permissions.user') {
        return <MfaSection />;
    }
    return null;
};

export { MFAConfigurationView };
