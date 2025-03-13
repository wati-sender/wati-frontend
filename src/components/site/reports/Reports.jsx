import React, { useEffect, useState } from 'react';
import { CheckOutlined, EyeOutlined, QuestionCircleOutlined, SendOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Card, Col, DatePicker, Flex, Row, Tooltip, Typography } from 'antd';
import { FaReplyAll } from 'react-icons/fa';
import { HiMiniSquare3Stack3D, HiOutlineArrowPathRoundedSquare } from 'react-icons/hi2';
import { IoCheckmarkDone } from 'react-icons/io5';
import { RxCrossCircled } from 'react-icons/rx';
import axiosInstance from '../../../axios/axiosInstance';

const Reports = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const getStatisticsData = async (dateRange) => {
        setLoading(true)
        try {
            const payload = {
                username: payment?.email,
                dateFrom: dateRange[0],
                dateTo: dateRange[1],
                searchString: "",
            };
            const { data } = await axiosInstance.post("/statistics/get", payload);
            if (data?.success) {
                setData([
                    { title: "Sent", value: data?.data?.totalSent, icon: <CheckOutlined /> },
                    { title: "Delivered", value: data?.data?.totalDelivered, icon: <IoCheckmarkDone /> },
                    { title: "Read", value: data?.data?.totalSent, icon: <EyeOutlined /> },
                    { title: "Replied", value: data?.data?.totalReplied, icon: <FaReplyAll /> },
                    { title: "Sending", value: data?.data?.totalSending, icon: <SendOutlined /> },
                    { title: "Failed", value: data?.data?.totalFailed, icon: <RxCrossCircled /> },
                    { title: "Processing", value: data?.data?.totalProcessing, icon: <HiOutlineArrowPathRoundedSquare /> },
                    { title: "Queued", value: data?.data?.totalQueued, icon: <HiMiniSquare3Stack3D /> },
                ]);
                setLoading(false);
            }
            console.log("Statistics Data: ", data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const handleDateChange = async (dates) => {

        if (dates) {

            const startDate = dates[0].toLocaleDateString().replace("/" , "-")
            console.log("Selected Dates: ", startDate);
        }
    };

    useEffect(() => {
        const initialDateFrom = "2025-01-01T00:00:00.000Z";
        const date = new Date()
        const initialDateTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T23:59:59.000Z`
        
        getStatisticsData([initialDateFrom, initialDateTo]);
    }, []);
    return (
        <PageContainer
            title="Reports"
        >
            <ProCard loading={loading} title="Statistics">
                <Row gutter={[16, 24]}>
                    {data?.map((item, index) => (
                        <Col key={index} xs={12} sm={6} md={6} lg={6} xl={3} >
                            <Card bodyStyle={{ padding: 15 }} hoverable>
                                <Flex justify='space-evenly' align='center'>
                                    <div>
                                        <Typography.Title level={3} style={{ padding: 0, margin: 0 }}>
                                            {item.value}
                                        </Typography.Title>
                                        <Typography.Title level={5} style={{ padding: 0, margin: 0 }}>
                                            {item?.title} <Tooltip title={item?.title}><QuestionCircleOutlined style={{ fontSize: 12, opacity: 0.5 }} /></Tooltip>
                                        </Typography.Title>
                                    </div>
                                    <div style={{ fontSize: 20 }}>
                                        {item.icon}
                                    </div>
                                </Flex>

                            </Card>
                        </Col>
                    ))}
                </Row>
            </ProCard>
        </PageContainer>
    )
}

export default Reports
