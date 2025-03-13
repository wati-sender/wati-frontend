import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axiosInstance from '../../../../axios/axiosInstance'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Card, List, message, Table, Tabs, Typography } from 'antd'

const SingleAccount = () => {

    const [accountReport, setAccountReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const { id } = useParams()
    const [activeKey, setActiveKey] = useState("inserted")

    const getAccountReport = async () => {
        try {
            setLoading(true)
            const { data } = await axiosInstance.get(`/reports/imports/accounts/${id}`)
            if (data.success) {
                setAccountReport(data.report)
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAccountReport()
    }, [id])

    const tabItems = [
        {
            label: `Inserted (${accountReport?.inserted?.length ?? 0})`,
            key: "inserted"
        },
        {
            label: `Exists (${accountReport?.exist?.length ?? 0})`,
            key: "exist"
        },
        {
            label: `Failed (${accountReport?.failed?.length ?? 0})`,
            key: "failed"
        },
    ]

    const tableData = useMemo(() => {
        if (!accountReport) return []
        return accountReport[activeKey] ?? []
    }, [accountReport , activeKey])

    const columns = [
        {
            title: "SN",
            width: 60,
            key: "sn",
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => name ?? "-",
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone ?? "-",
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (username) => username ?? "-",
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            render: (password) => password ?? "-",
        },
        {
            title: 'Login URL',
            dataIndex: 'loginUrl',
            key: 'loginUrl',
            render: (loginUrl) => <Link to={loginUrl}>{loginUrl} </Link> ?? "-",
        },
    ];

    return (
        <PageContainer title={`Account Import Reports ${(!loading && accountReport?.total > 0) ? ": Total " + accountReport?.total : ""}`} loading={loading}>
            <Tabs type='card' items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
            
            <Table
                columns={columns}
                dataSource={tableData}
            />

        </PageContainer>

    )
}

export default SingleAccount
