import { Button, Card, Flex, message, Popconfirm, Progress, Row, Space, Table, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import TableActions from '../../common/TableActions';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios/axiosInstance';


const { Text } = Typography
const AllCampaign = () => {

    // const allTemplates = templateData.result.items
    const [allCampaigns, setAllCampaigns] = useState([])
    const [loading, setLoading] = useState(false)
    const [campaignIds, setCampaignIds] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,

    });

    const navigate = useNavigate()

    const getCampaignsData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/messages/campaigns");
            if (data?.success) {
                setAllCampaigns(data.campaigns);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    }

    useEffect(() => {
        getCampaignsData();
    }, [])

    const tableButtons = useMemo(() => {
        return [
            <Button danger type='primary' disabled={campaignIds.length <= 0} onClick={() => handleMultipleDelete(campaignIds)}>
                Delete Selected
            </Button>,
            <Button
                type="primary"
                key={"create_template"}
                onClick={() => {
                    navigate("add");
                }}
                icon={<PlusCircleOutlined />}
            >
                Create Campaign
            </Button>,
        ];
    }, [navigate, campaignIds]);

    const rowSelectionDelete = {
        onChange: (selectedRowKeys) => {
            setCampaignIds(selectedRowKeys);
        },
    };

    const handleMultipleDelete = async (userIds) => {
        try {
            // const { data } = await axiosInstance.post("/accounts/delete/multiple", { userIds })
            message.success("Selected campaigns deleted successfully")
            getCampaignsData();
        } catch (error) {
            message.error(error.message)
        }
    }
    const handleSingleDelete = async (userId) => {
        try {
            // const { data } = await axiosInstance.post("/accounts/delete/single", { userId })
            message.success("Campaign deleted successfully")
            getCampaignsData();
        } catch (error) {
            message.error(error.message)
        }
    }

    const columns = [
        {
            title: "SN",
            width: 60,
            render: (text, record, index) => {
                return (pagination.pageSize * (pagination.current - 1) + (index + 1))
            },
        },
        {
            title: 'Campaign Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => <Link to={record?._id}>{name}</Link>
        },
        {
            title: 'Template',
            dataIndex: 'selectedTemplateName',
            key: 'selectedTemplateName',
        },
        {
            title: 'Total contacts',
            dataIndex: 'totalContacts',
            key: 'totalContacts',
            render: (recipients) => `${recipients} Contacts`
        },
        // {
        //     title: 'Successful',
        //     dataIndex: 'successCount',
        //     key: 'successCount',
        //     render: (count, record) => {
        //         const percent = ((count * 100) / record.totalContacts)

        //         return (
        //             <Space direction='vertical'>
        //                 <Text>{count} contacts </Text>
        //                 <Progress
        //                     percent={percent ?? 0}
        //                     percentPosition={{
        //                         align: 'center',
        //                         type: 'inner',
        //                     }}
        //                     size={[100, 20]}
        //                     strokeColor={percent === 0 ? "#CCFFCC" : "green"}
        //                 />
        //             </Space>
        //         )
        //     }
        // },
        // {
        //     title: 'Failed',
        //     dataIndex: 'failedCount',
        //     key: 'failedCount',
        //     render: (count, record) => {
        //         const percent = ((count * 100) / record.totalContacts)
        //         return (
        //             <Space direction='vertical'>
        //                 <Text>{count} contacts </Text>
        //                 <Progress
        //                     percent={percent ?? 0}
        //                     percentPosition={{
        //                         align: 'center',
        //                         type: 'inner',
        //                     }}
        //                     size={[100, 20]}
        //                     strokeColor={percent === 0 ? "#FFCCCC" : "#FF6666"}
        //                 />
        //             </Space>
        //         )
        //     }
        // },
        {
            title: "Actions",
            key: "action",
            fixed: "right",
            width: 100,
            render: (_, record, index) => (
                <Flex gap="small" vertical>
                    <Flex wrap gap="small">
                        <Tooltip
                            color="red"
                            title={<span style={{ fontSize: "0.8rem" }}>Delete</span>}
                        >
                            <Popconfirm
                                key={`confirmation-${record?._id}`}
                                icon={""}
                                description="Are you sure to delete this Account?"
                                onConfirm={() => {
                                    handleSingleDelete(record?._id);
                                }}
                                onCancel={() => { }}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button size="small" shape="circle" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    </Flex>
                </Flex>
            ),
        },
    ];

    return (
        <PageContainer
            title="Campaigns"
        >
            <Flex style={{
                flexDirection: 'column',
                gap: "1rem",
            }}>
                <TableActions
                    buttons={tableButtons}
                />

                <Card>
                    <Table
                        rowSelection={rowSelectionDelete}
                        loading={loading}
                        columns={columns}
                        dataSource={allCampaigns}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: allCampaigns.length,
                            showSizeChanger: true,
                            onChange: (page, pageSize) => {
                                setPagination({ current: page, pageSize });
                            },
                        }}
                        rowKey={(record) => record?.id}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        {"Total"}: <b>{allCampaigns.length}</b>
                                    </Typography.Text>
                                </Row>
                            );
                        }}
                    />
                </Card>
            </Flex>
        </PageContainer>
    )
}

export default AllCampaign
