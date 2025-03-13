import { Button, Card, Col, Flex, message, Popconfirm, Progress, Row, Table, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import TableActions from '../../../common/TableActions';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../axios/axiosInstance';
const Templates = () => {

    // const allTemplates = templateData.result.items
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(false)
    const [reportIds, setReportIds] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });


    const getTemplatesReport = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/reports/template/bulkcreate");
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
        getTemplatesReport();
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
            const { data } = await axiosInstance.post("/reports/template/bulkcreate/delete/multiple", { reportIds })
            if (data.success) {
                message.success(data.message)
                getTemplatesReport();
            }
        } catch (error) {
            message.error(error.message)
        }
    }
    const handleSingleDelete = async (reportId) => {
        try {
            const { data } = await axiosInstance.post("/reports/template/bulkcreate/delete/single", { reportId })
            if (data.success) {
                message.success(data.message)
                getTemplatesReport();
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
            title: 'Template Name',
            dataIndex: 'templateName',
            key: 'templateName',
            render: (text, record, index) => {
                return <Link to={record?._id}>{text}</Link>
            }
        },
        {
            title: 'Total Accounts',
            dataIndex: 'totalAccounts',
            key: 'totalAccounts',
        },
        {
            title: 'Success Accounts',
            dataIndex: 'success',
            key: 'success',
            render: (accounts) => accounts.length ?? 0
        },
        {
            title: 'Failed Accounts',
            dataIndex: 'failed',
            key: 'failed',
            render: (accounts) => accounts?.length ?? 0
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
            title="Templates Reports"
        >
            <ProCard>
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
            </ProCard>
        </PageContainer>
    )
}

export default Templates
