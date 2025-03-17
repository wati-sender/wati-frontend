import { Button, Card, Checkbox, Dropdown, Flex, Form, message, Modal, Popconfirm, Row, Select, Table, Tooltip, Typography, Upload } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, FilterOutlined, ImportOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import TableActions from '../../common/TableActions';
import * as XLSX from "xlsx";
import axiosInstance from '../../../axios/axiosInstance';
import { Link } from 'react-router-dom';
import { useDebounce } from '../useDebounce';


const AllAccounts = ({
    showSelect,
    showDelete,
    selectedAccounts,
    setSelectedAccounts
}) => {

    const [loading, setLoading] = useState(false);
    const [filterModal, setFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        account_status: "ALL",
        quality_rating: "ALL"
    })
    const [allAccounts, setAllAccounts] = useState([]);
    const [accountIds, setAccountIds] = useState([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const getAccountData = async (query) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();

            queryParams.append("page", page - 1);
            queryParams.append("limit", pageSize);

            if (query.account_status !== "ALL") {
                queryParams.append("account_status", query.account_status);
            }

            if (query.quality_rating !== "ALL") {
                queryParams.append("quality_rating", query.quality_rating);
            }

            if (search) {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = `accounts/all${queryString ? `?${queryString}` : ""}`;
            const { data } = await axiosInstance.get(url);
            setAllAccounts(data?.accounts);
            setTotal(data?.total);
            setLoading(false);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }

    }

    const debounce = useDebounce(search)

    useEffect(() => {
        getAccountData(filters);
    }, [page, pageSize, debounce])


    const handleUpload = async (file) => {
        try {
            const isExcel =
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
                file.type === "application/vnd.ms-excel"; // .xls

            if (!isExcel) {
                message.error("Only Excel files (.xls, .xlsx) are allowed!");
                return false;
            }

            const reader = new FileReader();

            reader.onload = async (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0]; // Get first sheet
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Format data to match desired JSON structure
                const accounts = jsonData.map(({ name, phone, username, password, loginUrl }) => ({ name, phone, username, password, loginUrl }));

                setLoading(true);
                const { data } = await axiosInstance.post("accounts/add/bulk", { accounts })
                if (data?.status) {
                    message.success("accounts added successfully")
                }
                getAccountData(filters)
            };

            reader.readAsBinaryString(file);
            return false;

        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false);
        }
    };

    const CustomSelectAll = () => {
        return <Checkbox onChange={(e) => {
            const checked = e.target.checked;
            if (checked) {
                setSelectedAccounts(allAccounts.map((item) => item._id))
            } else {
                setSelectedAccounts([])
            }
        }} />
    }

    const rowSelection = {
        selectedRowKeys: selectedAccounts,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedAccounts(selectedRows.map(({ _id }) => _id))
        },
        columnTitle: CustomSelectAll
    };

    const rowSelectionDelete = {
        onChange: (selectedRowKeys) => {
            setAccountIds(selectedRowKeys);
        },
    };

    const handleMultipleDelete = async (userIds) => {
        try {
            const { data } = await axiosInstance.post("/accounts/delete/multiple", { userIds })
            if (data.success) {
                message.success(data.message)
                getAccountData(filters);
            }
        } catch (error) {
            message.error(error.message)
        }
    }
    const handleSingleDelete = async (userId) => {
        try {
            const { data } = await axiosInstance.post("/accounts/delete/single", { userId })
            if (data.success) {
                message.success(data.message)
                getAccountData(filters);
            }
        } catch (error) {
            message.error(error.message)
        }
    }

    const tableButtons = [
        <Button onClick={() => setFilterModal(true)} icon={<FilterOutlined />}>
            Filters
        </Button>,
        ...(showSelect ? [] : [<Button danger type='primary' disabled={accountIds.length <= 0} onClick={() => handleMultipleDelete(accountIds)}>
            Delete Selected
        </Button>]),
        <Upload
            key={"import"}
            beforeUpload={handleUpload}
            showUploadList={false} >
            <Button type='primary' icon={<ImportOutlined />}>Import</Button>
        </Upload >,
        <Dropdown
            menu={{
                items: [
                    {
                        label: (
                            <a download href='/sample/sample-accounts.xlsx' >Download Sample Excel File</a>
                        ),
                    },
                ],
            }}
            trigger={["hover"]}
        >
            <Button type='primary'><DownOutlined /></Button>
        </Dropdown>
    ]

    const columns = [
        {
            title: "SN",
            width: 60,
            key: "sn",
            render: (text, record, index) => (page - 1) * pageSize + (1 + index),
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
            render: (loginUrl) => <Link to={loginUrl} target='_blank'>{loginUrl} </Link> ?? "-",
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
            title="Accounts"
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
                        rowSelection={showSelect ? rowSelection : showDelete && rowSelectionDelete}
                        columns={columns}
                        dataSource={allAccounts}
                        loading={loading}
                        scroll={{
                            x: 1000,
                        }}
                        pagination={{
                            total: total,
                            current: page,
                            pageSize: pageSize,
                            onChange(p, ps) {
                                if (p !== page) setPage(p);
                                if (ps !== pageSize) setPageSize(ps);
                            },
                        }}
                        rowKey={(record) => record._id}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        Total: <b>{total}</b>
                                    </Typography.Text>
                                    <Typography.Text>
                                        {showSelect && <>Selected: <b>{selectedAccounts?.length}</b></>}
                                    </Typography.Text>
                                </Row>
                            );
                        }}
                    />
                </Card>
            </Flex>

            <Modal
                title="Apply Filters"
                centered
                open={filterModal}
                onOk={() => {
                    getAccountData(filters);
                    setFilterModal(false);
                }}
                onCancel={() => setFilterModal(false)}
                okText="Apply"
                cancelText="Cancel"
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Filter by Account Status"
                        initialValue={filters.account_status}
                    >
                        <Select
                            value={filters.account_status}
                            onChange={(value) => setFilters(prev => ({ ...prev, account_status: value }))}
                            style={{ width: "100%" }}
                            options={[
                                { label: "ALL", value: "ALL" },
                                { label: "CONNECTED", value: "CONNECTED" },
                                { label: "BANNED", value: "BANNED" },
                                { label: "FLAG", value: "FLAG" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Filter by Quality Rating"
                        initialValue={filters.quality_rating}
                    >
                        <Select
                            value={filters.quality_rating}
                            onChange={(value) => setFilters(prev => ({ ...prev, quality_rating: value }))}
                            style={{ width: "100%" }}
                            options={[
                                { label: "ALL", value: "ALL" },
                                { label: "GREEN", value: "GREEN" },
                                { label: "MEDIUM", value: "MEDIUM" },
                                { label: "LOW", value: "LOW" },
                            ]}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </PageContainer>
    )
}

export default AllAccounts    
