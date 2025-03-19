import { Button, Card, Flex, message, Popconfirm, Progress, Row, Space, Table, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import TableActions from '../../common/TableActions';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios/axiosInstance';
import { useDebounce } from '../useDebounce';


const { Text } = Typography
const AllCampaign = () => {

    // const allTemplates = templateData.result.items
    const [allCampaigns, setAllCampaigns] = useState([])
    const [loading, setLoading] = useState(false)
    const [campaignIds, setCampaignIds] = useState([]);

    const navigate = useNavigate()

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const getCampaignsData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/messages/campaigns?limit=${pageSize}&page=${page - 1}&search=${search}`);
            if (data?.success) {
                setAllCampaigns(data.campaigns);
                setTotal(data.total);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const debounce = useDebounce(search)


    useEffect(() => {
        getCampaignsData();
    }, [page, pageSize, debounce])

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
                return (pageSize * (page - 1) + (index + 1))
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
            title: 'Total Accounts',
            dataIndex: 'selectedAccounts',
            key: 'selectedAccounts',
            render: (accounts) => `${accounts?.length} Accounts`
        },
        {
            title: 'Total contacts',
            dataIndex: 'totalContacts',
            key: 'totalContacts',
            render: (recipients) => `${recipients} Contacts`
        },
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
                    showSearch
                    search={search}
                    setSearch={setSearch}
                />

                <Card>
                    <Table
                        rowSelection={rowSelectionDelete}
                        loading={loading}
                        columns={columns}
                        dataSource={allCampaigns}
                        pagination={{
                            total: total,
                            current: page,
                            pageSize: pageSize,
                            onChange(p, ps) {
                                if (p !== page) setPage(p);
                                if (ps !== pageSize) setPageSize(ps);
                            },
                        }}
                        rowKey={(record) => record?.id}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        {"Total"}: <b>{total}</b>
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
