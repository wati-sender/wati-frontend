import { Button, Card, Flex, message, Modal, Popconfirm, Radio, Row, Table, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import TableActions from '../../common/TableActions';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios/axiosInstance';
import { render } from 'react-dom';

const AllTemplates = ({
    showDelete,
    showSelect,
    selectedTemplate,
    setSelectedTemplate,
}) => {

    // const allTemplates = templateData.result.items
    const [allTemplates, setAllTemplates] = useState([])
    const [loading, setLoading] = useState(false)
    const [templateIds, setTemplatesIds] = useState([]);
    const [submittingIds, setSubmittingIds] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,

    });

    const navigate = useNavigate()

    const [modal] = Modal.useModal();

    const getTemplatesData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`templates/all`);
            setAllTemplates(data?.templates);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTemplatesData();
    }, [])

    const tableButtons = useMemo(() => {
        return [
            ...(showSelect ? [] : [<Button danger type='primary' disabled={templateIds.length <= 0} onClick={() => handleMultipleDelete(templateIds)}>
                Delete Selected
            </Button>]),
            <Button
                type="primary"
                key={"create_template"}
                onClick={() => {
                    navigate("/templates/add");
                }}
                icon={<PlusCircleOutlined />}
            >
                Create Template
            </Button>,
        ];
    }, [navigate, templateIds]);

    const rowSelectionDelete = {
        onChange: (selectedRowKeys) => {
            setTemplatesIds(selectedRowKeys);
        },
    };

    const handleMultipleDelete = async (userIds) => {
        try {
            // const { data } = await axiosInstance.post("/accounts/delete/multiple", { userIds })
            message.success("Selected templates deleted successfully")
            getTemplatesData();
        } catch (error) {
            message.error(error.message)
        }
    }
    const handleSingleDelete = async (userId) => {
        try {
            // const { data } = await axiosInstance.post("/accounts/delete/single", { userId })
            message.success("template deleted successfully")
            getTemplatesData();
        } catch (error) {
            message.error(error.message)
        }
    }

    const handleSubmitForReview = async (record) => {
        setSubmittingIds(prev => [...prev, record._id])

        try {
            const { data } = await axiosInstance.post("/templates/review/submit", {
                template_name: record.name
            })
            if (data.success) {
                message.success(data.message)
                getTemplatesData();
            } else {
                message.error(data.message)
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setSubmittingIds(prev => prev.filter(id => id !== record._id))
        }
    }

    const columns = [
        {
            title: "SN",
            width: 60,
            render: (text, { _id, name }, index) => {
                return (showSelect ? <Radio
                    checked={selectedTemplate === name}
                    onChange={() => setSelectedTemplate(name)}
                    id={_id}
                >
                    {pagination.pageSize * (pagination.current - 1) + (index + 1)}
                </Radio> : <>{pagination.pageSize * (pagination.current - 1) + (index + 1)}</>)
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, { _id }) => <Link to={_id}>{name}</Link>
        },
        {
            title: 'Success',
            dataIndex: 'successCount',
            key: 'successCount',
            render: (count) => `${count} Accounts`
        },
        {
            title: 'Failed',
            dataIndex: 'failedCount',
            key: 'failedCount',
            render: (count) => `${count} Accounts`
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: "Actions",
            key: "action",
            fixed: "right",
            width: 230,
            render: (_, record) => (
                <Flex gap="small" vertical>
                    <Flex wrap gap="small" justify='end'>
                        {!record?.submittedForReview && <Button
                            type='primary'
                            onClick={() => handleSubmitForReview(record)}
                            loading={submittingIds.includes(record._id)}
                            disabled={submittingIds.includes(record._id)}

                        >
                            {submittingIds.includes(record._id) ? "Submitting" : "Submit For Review"}
                        </Button>}
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
            title="Templates"
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
                        rowSelection={showDelete && rowSelectionDelete}
                        loading={loading}
                        columns={columns}
                        dataSource={allTemplates}
                        scroll={{
                            x: 1200,
                        }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: allTemplates.length,
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
                                        {"Total"}: <b>{allTemplates.length}</b>
                                    </Typography.Text>
                                    {showSelect && <Typography.Text>
                                        {"Selected"}: <b>{selectedTemplate}</b>
                                    </Typography.Text>}
                                </Row>
                            );
                        }}
                    />
                </Card>
            </Flex>
        </PageContainer>
    )
}

export default AllTemplates
