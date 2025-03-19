import { Button, Card, Flex, message, Row, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import { PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import TableActions from '../../common/TableActions';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios/axiosInstance';
import { useDebounce } from '../useDebounce';


const { Text } = Typography
const AllCampaign = () => {

    const [allCampaigns, setAllCampaigns] = useState([])
    const [loading, setLoading] = useState(false)

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

    const tableButtons = [
        <Button
            type="primary"
            key={"create_template"}
            onClick={() => {
                navigate("add");
            }}
            icon={<PlusCircleOutlined />}
        >
            Create Campaign
        </Button>
    ]

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
