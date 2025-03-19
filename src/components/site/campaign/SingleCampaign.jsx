import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, message, Table, Typography, Modal, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';
const SingleCampaign = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

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
            render: (name) => name ?? "-",
        },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Password', dataIndex: 'password', key: 'password' },
        {
            title: 'Login URL',
            dataIndex: 'loginUrl',
            key: 'loginUrl',
            render: (loginUrl) => loginUrl ? <Link to={loginUrl} target='_blank'>{loginUrl}</Link> : "-",
        },
        {
            title: "Actions",
            key: "action",
            fixed: "right",
            width: 100,
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
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={900}
            >
                {reportLoading ? (
                    <Spin size="large" style={{ display: 'flex', justifyContent: 'center' }} />
                ) : reportData ? (
                    <>
                        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 15 }, header: { padding: 15 } }} title="Campaign Details">
                            <Typography.Text><strong>Campaign Name:</strong> {reportData?.broadcast?.name}</Typography.Text><br />
                            <Typography.Text><strong>Status:</strong> {reportData?.broadcast?.status}</Typography.Text><br />
                            <Typography.Text><strong>Sent At:</strong> {new Date(reportData?.broadcast?.sentAt).toLocaleString()}</Typography.Text>
                        </Card>
                        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 15 }, header: { padding: 15 } }} title="Account Details">
                            <Typography.Text><strong>Name:</strong> {reportData.account.name}</Typography.Text><br />
                            <Typography.Text><strong>Phone:</strong> {reportData.account.phone}</Typography.Text><br />
                            <Typography.Text><strong>Username:</strong> {reportData.account.username}</Typography.Text>
                        </Card>

                        <Typography.Title level={5}>Statistics {reportData?.statistics?.totalContacts ? `: Total ${reportData.statistics.totalContacts} Contacts` : ''}</Typography.Title>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between', // Ensures 5 in a row
                            gap: '16px', // Controls spacing
                            marginBottom: '16px'
                        }}>
                            {Object.entries(reportData.statistics)
                                .filter(([key]) => key !== 'broadcastId')
                                .filter(([key]) => key !== 'totalContacts')
                                .map(([key, value], index) => (
                                    <Card
                                        key={index}
                                        size="small"
                                        style={{
                                            flex: '1 1 calc(20% - 16px)', // Ensures exactly 5 cards per row
                                            textAlign: 'center',
                                            background: "#f9f9f9",
                                            borderRadius: 8,
                                            padding: 8,
                                            minWidth: '150px', // Prevents too small cards on small screens
                                            maxWidth: '200px' // Keeps consistent size
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

                    </>
                ) : (
                    <Typography.Text>No report available.</Typography.Text>
                )}
            </Modal>
        </PageContainer >
    );
};

export default SingleCampaign;
