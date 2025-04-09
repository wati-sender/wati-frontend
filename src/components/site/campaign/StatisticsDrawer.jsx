import { useState, useEffect } from 'react'
import { message, Drawer, Table, Select, Spin, Button, Flex, Row, Col, Tag, Typography } from 'antd'
import axiosInstance from '../../../axios/axiosInstance'
import { ExportOutlined } from '@ant-design/icons'
import { exportToExcel } from 'react-json-to-excel'

const StatisticsDrawer = ({ open, setOpen, watiCampaignId, accountId }) => {

    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [option, setOption] = useState(0)
    const [failedReason, setFailedReason] = useState(0)
    const [dataSource, setDataSource] = useState([])
    const [totalCount, setTotalCount] = useState(0)

    const options = [
        { value: 0, label: 'All' },
        { value: 1, label: 'Failed' },
        { value: 2, label: 'Read' },
        { value: 3, label: 'Replied' },
        { value: 4, label: 'Ignored' },
        { value: 5, label: 'Clicked' },
    ]

    const failedReasons = [
        { value: 0, label: 'All' },
        { value: 1, label: 'Message undeliverable' },
        { value: 2, label: 'Meta restriction (frequency cap)' },
        { value: 3, label: 'Invalid template' },
        { value: 4, label: 'System related errors' },
        { value: 6, label: 'Opted out of marketing messages' },
    ]

    // Function to fetch statistics
    const getStatistic = async () => {
        try {
            setLoading(true)
            const payload = {
                watiCampaignId,
                accountId,
                pageSize,
                pageNumber: pageNumber - 1,
                option,
                failedReason: option === 1 ? failedReason : 0
            }
            const { data } = await axiosInstance.post("/messages/campaigns/statistics", payload)
            if (data?.success) {
                setDataSource(data?.data?.result?.items || [])
                setTotalCount(data?.data?.result?.total || 0)
            } else[
                message.error(data?.message)
            ]
        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            getStatistic()
        }
    }, [open, pageSize, pageNumber, option, failedReason])

    useEffect(() => {
        setPageNumber(1)
    }, [option, failedReason])

    const STATSISTIC_STATUS = {
        '5': 'Sent',
        '6': 'Failed',
        '4': 'Read',
        '3': 'Delivered',
        '7': 'Replied',
    }

    const TAG_COLORS = {
        '5': '#108ee9',
        '6': '#f50',
        '4': '#87d068',
        '3': '#32db64',
        '7': '#85d0ff',
    }

    // Columns for the Table
    const columns = [
        {
            title: "SN", width: 60, key: "sn", render: (text, record, index) => (pageNumber - 1) * pageSize + (1 + index),
        },
        { title: 'Contact', dataIndex: 'contactPhone', key: 'contactPhone', width: 100 },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 80, render: (status) => <Tag color={TAG_COLORS[status]} >{STATSISTIC_STATUS[status]}</Tag> },
        { title: 'Failure Reason', dataIndex: 'failedDetail', key: 'failedDetail', render: (text) => text ? text : "-" },
    ]


    const handleExport = async () => {
        try {
            setExporting(true)
            const payload = {
                watiCampaignId,
                accountId,
                pageSize: totalCount,
                pageNumber: 0,
                option,
                failedReason: option === 1 ? failedReason : 0
            }
            const { data } = await axiosInstance.post("/messages/campaigns/statistics", payload)
            if (data?.success) {
                const exportData = data?.data?.result?.items?.map((itm) => ({
                    phone: itm?.contactPhone,
                    Status: STATSISTIC_STATUS[itm.status],
                    "Failure Reason": itm?.failedDetail
                }));
                exportToExcel(exportData, "reports");
            } else {
                message.error(data?.message)
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setExporting(false)
        }
    }


    return (
        <Drawer
            title="Statistics"
            open={open}
            onClose={() => {
                setOpen(false)
                setPageNumber(1)
                setOption(0)
                setFailedReason(0)
                setDataSource([])
                setTotalCount(0)
            }}
            destroyOnClose
            width={600}
        >
            <Row gutter={18}>
                <Col xs={12} md={8}>
                    <Select
                        value={option}
                        onChange={(value) => setOption(value)}
                        style={{ width: "100%" }}
                        options={options.map(opt => ({ value: opt.value, label: opt.label }))}
                    />
                </Col>
                <Col xs={12} md={10}>
                    {option === 1 && (
                        <Select
                            value={failedReason}
                            onChange={(value) => setFailedReason(value)}
                            style={{ width: "100%" }}
                            options={failedReasons.map(reason => ({ value: reason.value, label: reason.label }))}
                        />
                    )}
                </Col>
                <Col xs={12} md={6}>
                    <Button block style={{ textAlign: "end" }} loading={exporting} disabled={exporting} onClick={handleExport} type='primary' icon={<ExportOutlined />}>Export</Button>
                </Col>

            </Row>

            <Spin spinning={loading}>
                <Typography.Title level={5}>Total : {totalCount}</Typography.Title>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={{
                        total: totalCount,
                        current: pageNumber,
                        pageSize: pageSize,
                        onChange(p, ps) {
                            if (p !== pageNumber) setPageNumber(p);
                            if (ps !== pageSize) setPageSize(ps);
                        },
                    }}
                    virtual={true}
                    loading={loading}
                    total={totalCount}
                    rowClassName="editable-row"
                />
            </Spin>
        </Drawer>
    )
}

export default StatisticsDrawer
