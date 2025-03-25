import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, message, Table, Typography, Modal, Spin, Row, Col, Flex } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';
import StatisticsDrawer from './StatisticsDrawer';

const { Text } = Typography
const SingleCampaign = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [statisticsDrawer, setstatisticsDrawer] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [currentAccId, setCurrentAccId] = useState("");
    const [watiCampId, setWatiCampId] = useState("");

    const statisticData = useMemo(() => {

        if (campaign?.statistics) {

            const data = [
                {
                    title: "Sent",
                    value: campaign?.statistics?.totalSent,
                    status: 'default',
                }, {
                    title: "Delivered",
                    value: campaign?.statistics?.totalDelivered,
                    status: 'success',
                }, {
                    title: "Read",
                    value: campaign?.statistics?.totalOpen,
                    status: 'warning',
                }, {
                    title: "Replied",
                    value: campaign?.statistics?.totalReplied,
                    status: 'processing',
                }, {
                    title: "Sending",
                    value: campaign?.statistics?.totalSending,
                    status: 'processing',
                }, {
                    title: "Failed",
                    value: campaign?.statistics?.totalFailed,
                    status: 'error',
                }, {
                    title: "Processing",
                    value: campaign?.statistics?.totalProcessing,
                    status: 'processing',
                }, {
                    title: "Queued",
                    value: campaign?.statistics?.totalQueued,
                    status: 'default',
                }
            ]

            return data
        }

    }, [campaign]);

    console.log("statisticData", { campaign, statisticData });



    const handleViewReport = async (campaignId, accountId) => {
        setIsModalVisible(true);
        setReportLoading(true);
        try {
            const { data } = await axiosInstance.post("/messages/campaign/report/account", { campaignId, accountId });
            if (data.success) {
                setReportData(data);
                setCurrentAccId(accountId);
                setWatiCampId(data?.broadcast?.wati_broadcastId);
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setReportLoading(false);
        }
    };



    const getCampaignData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/messages/campaigns/${id}`);
            if (data.success) {
                setCampaign(data);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) getCampaignData();
    }, [id]);

    const isErrorAcc = (username) => {
        let err = false

        if (campaign?.error.length === 0) {
            err = false
        }

        const errAcc = campaign?.error?.find(acc => acc.username === username)

        if (errAcc) {
            err = errAcc
        }

        return err
    }

    const CURRENCY_SYMBOL = {
        "INR": "₹",
        "USD": "$",
    }

    const MESSAGES_TEIRS = {
        TIER_1K: "1000 Messages",
        TIER_10K: "10000 Messages",
        TIER_100K: "100000 Messages",
    }


    const columns = [
        {
            title: "SN",
            width: 60,
            key: "sn",
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            render: (name) => name ?? "-",
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 150
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 250,
        },
        {
            title: 'Wallet',
            dataIndex: 'wallet',
            key: 'wallet',
            width: 150,
            render: (wallet, { currency = "INR" }) => wallet ? <Text strong style={{ color: wallet < 0 ? "#FF6347" : "#00B16A" }}>{CURRENCY_SYMBOL[currency] + wallet}</Text> : "-",
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => status ?? "-",
        },
        {
            title: 'Quality Rating',
            dataIndex: 'qualityRating',
            key: 'qualityRating',
            width: 150,
            render: (rating) => rating ?? "-",
        },
        {
            title: 'Message Limit',
            dataIndex: 'messageTier',
            key: 'messageTier',
            width: 150,
            render: (tier) => MESSAGES_TEIRS[tier] ?? "-",
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            width: 200,
            render: (password) => <Text copyable>{password}</Text> ?? "-",
        },
        {
            title: 'Login URL',
            dataIndex: 'loginUrl',
            key: 'loginUrl',
            width: 250,
            render: (loginUrl, { username }) => <Link to={`${loginUrl}?email=${username}`} target='_blank'>{loginUrl} </Link> ?? "-",
        },
        {
            title: "Actions",
            key: "action",
            fixed: "right",
            width: 130,
            render: (_, record) => (
                <Button type='primary' onClick={() => handleViewReport(id, record?._id)}>
                    View Report
                </Button>
            ),
        },
    ];

    return (
        <PageContainer loading={loading} title={"Campaign Report"}>
            <Card style={{ marginBottom: 16 }}>
                <Typography.Text style={{ fontSize: 16 }}>Campaign Name:  <strong>{campaign?.campaign?.name} </strong></Typography.Text><br />
                <Typography.Text style={{ fontSize: 16 }}>Selected Template: <strong>{campaign?.campaign?.selectedTemplateName}</strong></Typography.Text><br />
                <Typography.Text style={{ fontSize: 16 }}>Selected Accounts: <strong>{campaign?.campaign?.selectedAccounts?.length} Accounts</strong></Typography.Text> <br />
                <Typography.Text style={{ fontSize: 16 }}>Total Contacts: <strong>{campaign?.campaign?.totalContacts ?? 0} Contacts</strong></Typography.Text>
            </Card>
            <Card title="Selected Accounts">
                <Table
                    columns={columns}
                    dataSource={campaign?.campaign?.selectedAccounts ?? []}
                    scroll={{
                        x: 1500,
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                    }}
                />
            </Card>

            <Modal
                title={`Account Report ${reportLoading ? "" : " of " + reportData?.account?.username || ""}`}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setReportData(null);
                    setCurrentAccId(null);
                    setWatiCampId(null);
                }}
                onClose={() => {
                    setIsModalVisible(false);
                    setReportData(null);
                    setCurrentAccId(null);
                    setWatiCampId(null);
                }}
                footer={null}
                width={900}
            >
                {reportLoading ? (
                    <Spin size="large" style={{ display: 'flex', justifyContent: 'center' }} />
                ) : reportData ? (
                    <>
                        <Row gutter={24}>
                            <Col xs={24} lg={12}>
                                <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 15 }, header: { padding: 15 } }} title="Campaign Details">
                                    <Typography.Text><strong>Campaign Name:</strong> {reportData?.broadcast?.name}</Typography.Text><br />
                                    <Typography.Text><strong>Status:</strong> {reportData?.broadcast?.status}</Typography.Text><br />
                                    <Typography.Text><strong>Sent At:</strong> {new Date(reportData?.broadcast?.sentAt).toLocaleString()}</Typography.Text>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 15 }, header: { padding: 15 } }} title="Account Details">
                                    <Typography.Text><strong>Name:</strong> {reportData.account.name}</Typography.Text><br />
                                    <Typography.Text><strong>Phone:</strong> {reportData.account.phone}</Typography.Text><br />
                                    <Typography.Text><strong>Username:</strong> {reportData.account.username}</Typography.Text>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 15 }, header: { padding: "0 15px" } }} title={<Flex align='center' justify='space-between'><p>Statistics</p><Button type='primary' onClick={() => setstatisticsDrawer(true)}>View Statistics</Button></Flex>}>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between',
                                        gap: '16px',
                                        marginBottom: '16px'
                                    }}>
                                        {Object.entries(reportData.statistics)
                                            .map(([key, value], index) => (
                                                <Card
                                                    key={index}
                                                    size="small"
                                                    style={{
                                                        flex: '1 1 calc(20% - 16px)',
                                                        textAlign: 'center',
                                                        background: "#f9f9f9",
                                                        borderRadius: 8,
                                                        padding: 8,
                                                        minWidth: '150px',
                                                        maxWidth: '200px'
                                                    }}
                                                >
                                                    <Typography.Title level={5} style={{ marginTop: 8, fontSize: 16 }}>
                                                        {value}
                                                    </Typography.Title>
                                                    <Typography.Text style={{ fontSize: 12, textTransform: 'capitalize' }}>
                                                        {key}
                                                    </Typography.Text>
                                                </Card>
                                            ))}
                                    </div>
                                </Card>
                            </Col>

                        </Row>
                    </>
                ) : (
                    <Typography.Text>No report available.</Typography.Text>
                )}
            </Modal>
            <StatisticsDrawer open={statisticsDrawer} setOpen={setstatisticsDrawer} accountId={currentAccId} watiCampaignId={watiCampId} />

        </PageContainer >
    );
};

export default SingleCampaign;
