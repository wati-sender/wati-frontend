import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../../axios/axiosInstance'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Card, message, Row, Table, Tag, Typography } from 'antd'
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons'

const SingleTemplate = () => {

    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(false)
    const { id } = useParams()
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const getTemplateData = async () => {
        try {
            setLoading(true)
            const { data } = await axiosInstance.post("/templates/check/review/status", {
                reportId: id
            })
            if (data.success) {
                setTemplates(data?.data)
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) getTemplateData()
    }, [id])


    const TEMPLATE_STATUS = {
        APPROVED: "success",
        DRAFT: "warning",
        REJECTED: "error",
        PENDING: "processing"
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
        },
        {
            title: 'Username',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Status',
            dataIndex: 'reviewStatus',
            key: 'reviewStatus',
            render: (status) => (
                <Tag color={TEMPLATE_STATUS[status]}>{status}</Tag>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Date, Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                const newDate = new Date(date);
                return newDate.toLocaleString();
            }
        },
    ];




    return (
        <PageContainer
            title={`Report : ${templates[0]?.templateName}`}
            loading={loading}
        >
            <Card>
                <Table
                    columns={columns}
                    dataSource={templates}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: templates.length,
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
                                    {"Total"}: <b>{templates.length}</b>
                                </Typography.Text>
                            </Row>
                        );
                    }}
                />
            </Card>
        </PageContainer>
    )
}

export default SingleTemplate
