import { Button, Card, Col, Flex, message, Popconfirm, Progress, Row, Table, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import TableActions from '../../../common/TableActions';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../axios/axiosInstance';
const Accounts = () => {

    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(false)
    const [reportIds, setReportIds] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,

    });


    const getAccountsReport = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/reports/imports/accounts");
            if (data?.success) {
                setReportIds([])
                setReports(data.reports)
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAccountsReport();
    }, [])

    const tableButtons = [
        <Button danger type='primary' disabled={reportIds.length <= 0} onClick={() => handleMultipleDelete(reportIds)}>
            Delete Selected
        </Button>
    ]

    const rowSelectionDelete = {
        selectedRowKeys: reportIds,
        onChange: (selectedRowKeys) => {
            setReportIds(selectedRowKeys);
        },
    };

    const handleMultipleDelete = async (reportIds) => {
        try {
            const { data } = await axiosInstance.post("/reports/account/delete/multiple", { reportIds })
            if (data.success) {
                message.success(data.message)
                getAccountsReport();
            }
        } catch (error) {
            message.error(error.message)
        }
    }
    const handleSingleDelete = async (reportId) => {
        try {
            const { data } = await axiosInstance.post("/reports/account/delete/single", { reportId })
            if (data.success) {
                message.success(data.message)
                getAccountsReport();
            }
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
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `${total ?? 0} Accounts`
        },
        {
            title: 'Insert',
            dataIndex: 'inserted',
            key: 'inserted',
            render: (accounts) => `${accounts?.length ?? 0} Accounts`
        },
        {
            title: 'Exist',
            dataIndex: 'exist',
            key: 'exist',
            render: (accounts) => `${accounts.length ?? 0} Accounts`
        },
        {
            title: 'Failed',
            dataIndex: 'failed',
            key: 'failed',
            render: (accounts) => `${accounts?.length ?? 0} Accounts`
        },
        {
            title: 'Date, Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                const newDate = new Date(date);
                return newDate.toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                });

            }
        },
        {
            title: "Actions",
            key: "action",
            fixed: "right",
            width: 200,
            render: (_, record, index) => (
                <Flex gap="small" vertical>
                    <Flex wrap gap="small">
                        <Button type='primary' onClick={() => navigate(record?._id)}>
                            View Reports
                        </Button>
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
                                <Button shape="circle" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    </Flex>
                </Flex>
            ),
        },
    ];

    return (
        <PageContainer
            title="Accounts Reports"
        >
            <Flex style={{
                flexDirection: 'column',
                gap: "1rem",
                padding: "0 2.5rem"
            }}>
                <TableActions
                    buttons={tableButtons}
                />

                <Card>
                    <Table
                        rowSelection={rowSelectionDelete}
                        loading={loading}
                        columns={columns}
                        dataSource={reports}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: reports.length,
                            showSizeChanger: true,
                            onChange: (page, pageSize) => {
                                setPagination({ current: page, pageSize });
                            },
                        }}
                        rowKey={(record) => record?._id}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        {"Total"}: <b>{reports.length}</b>
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

export default Accounts
