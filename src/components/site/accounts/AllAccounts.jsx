import { Button, Card, Checkbox, Dropdown, Flex, Form, message, Modal, Popconfirm, Row, Select, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, ExportOutlined, FilterOutlined, ImportOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import TableActions from '../../common/TableActions';
import * as XLSX from "xlsx";
import axiosInstance from '../../../axios/axiosInstance';
import { Link } from 'react-router-dom';
import { useDebounce } from '../useDebounce';
import { exportToExcel } from "react-json-to-excel";

const { Text } = Typography
const AllAccounts = ({
    showSelect,
    showDelete,
    selectedAccounts,
    setSelectedAccounts = () => { }
}) => {


    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [filterModal, setFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        account_status: ["ALL"],
        quality_rating: ["ALL"],
        tier: ["ALL"]
    })

    const [allAccounts, setAllAccounts] = useState([]);
    const [accountIds, setAccountIds] = useState([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const debounce = useDebounce(search)

    const MESSAGES_TEIRS = {
        TIER_1K: "1000 Messages",
        TIER_10K: "10000 Messages",
        TIER_100K: "100000 Messages",
    }

    const CURRENCY_SYMBOL = {
        "INR": "₹",
        "USD": "$",
    }

    const getAccountData = async (query) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();

            queryParams.append("page", page - 1);
            queryParams.append("limit", pageSize);

            if (!query.account_status.includes("ALL")) {
                queryParams.append("account_status", query.account_status.join("_"));
            }

            if (!query.quality_rating.includes("ALL")) {
                queryParams.append("quality_rating", query.quality_rating.join("_"));
            }

            if (!query.tier.includes("ALL")) {
                queryParams.append("tier", query.tier.join("-"));
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

    useEffect(() => {
        getAccountData(filters);
        setSelectedAccounts([])
    }, [page, pageSize, debounce])

    console.log("total Wallet", allAccounts.reduce((acc, account) => acc + (account.wallet * (account.currency === "USD" ? 85.77 : 1)), 0));


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

    const handleSelectAll = async (checked, query) => {
        if (!checked) {
            setSelectedAccounts([]);
            return;
        }

        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (!query.account_status.includes("ALL")) {
                queryParams.append("account_status", query.account_status.join("_"));
            }

            if (!query.quality_rating.includes("ALL")) {
                queryParams.append("quality_rating", query.quality_rating.join("_"));
            }

            if (!query.tier.includes("ALL")) {
                queryParams.append("tier", query.tier.join("-"));
            }

            if (search) {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = `accounts/all/ids${queryString ? `?${queryString}` : ""}`;
            const { data } = await axiosInstance.get(url);

            if (data?.status) {
                setSelectedAccounts(data?.ids)
            }


        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }


    const CustomSelectAll = () => {
        return <Checkbox onChange={(e) => {
            const checked = e.target.checked;
            // if (checked) {
            //     setSelectedAccounts(allAccounts.map((item) => item?._id))
            // } else {
            //     setSelectedAccounts([])
            // }
            handleSelectAll(checked, filters)

        }} indeterminate={selectedAccounts.length !== total && selectedAccounts.length !== 0} checked={selectedAccounts.length === total} />
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

    const handleExport = async (query) => {
        setExporting(true);
        try {
            const queryParams = new URLSearchParams();

            queryParams.append("page", 0);
            queryParams.append("limit", total);

            if (!query.account_status.includes("ALL")) {
                queryParams.append("account_status", query.account_status.join("_"));
            }

            if (!query.quality_rating.includes("ALL")) {
                queryParams.append("quality_rating", query.quality_rating.join("_"));
            }

            if (!query.tier.includes("ALL")) {
                queryParams.append("tier", query.tier.join("-"));
            }

            if (search) {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = `accounts/all${queryString ? `?${queryString}` : ""}`;
            const { data } = await axiosInstance.get(url);
            const exportData = data?.accounts?.map((account) => ({
                Name: account?.name,
                Phone: account.phone,
                Username: account.username,
                Wallet: account.wallet,
                Status: account.status,
                "Quality Rating": account.qualityRating,
                "Message Limit": MESSAGES_TEIRS[account.messageTier],
                Password: account.password,
                "Login URL": account.loginUrl,
            }));
            exportToExcel(exportData, "accounts");
        } catch (error) {
            message.error(error.message);
        } finally {
            setExporting(false);
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
        <Button loading={exporting} disabled={exporting} onClick={() => handleExport(filters)} type='primary' icon={<ExportOutlined />}>Export</Button>,
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
            width: 120,
            render: (name) => name ?? "-",
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone) => phone ?? "-",
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 250,
            render: (username) => username ?? "-",
        },
        {
            title: 'Wallet',
            dataIndex: 'wallet',
            key: 'wallet',
            width: 150,
            render: (wallet, { currency = "INR" }) => <Text strong style={{ color: wallet < 0 ? "#FF6347" : "#00B16A" }}>{CURRENCY_SYMBOL[currency] + wallet}</Text> ?? "-",
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => status ?? "-",
        },
        {
            title: 'Quality Rating',
            dataIndex: 'qualityRating',
            key: 'qualityRating',
            width: 150,
            render: (rating) => rating ?? "-",
        },
        {
            title: 'Message Limit',
            dataIndex: 'messageTier',
            key: 'messageTier',
            width: 150,
            render: (tier) => MESSAGES_TEIRS[tier] ?? "-",
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            width: 200,
            render: (password) => <Text copyable>{password}</Text> ?? "-",
        },
        {
            title: 'Login URL',
            dataIndex: 'loginUrl',
            key: 'loginUrl',
            width: 250,
            render: (loginUrl, { username }) => <Link to={`${loginUrl}?email=${username}`} target='_blank'>{loginUrl} </Link> ?? "-",
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
                    <Text>Last Update : {new Date(allAccounts[0]?.updatedAt).toLocaleString()}</Text>
                    <br /> <br />
                    <Table
                        rowSelection={showSelect ? rowSelection : showDelete && rowSelectionDelete}
                        columns={columns}
                        dataSource={allAccounts}
                        loading={loading}
                        scroll={{
                            x: 1500,
                        }}
                        pagination={{
                            total,
                            current: page,
                            pageSize: pageSize,
                            showSizeChanger: true,
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
                    setSelectedAccounts([])
                    setPage(1)
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
                            mode='multiple'
                            value={filters.account_status}
                            onChange={(value) => setFilters(prev => ({ ...prev, account_status: value }))}
                            style={{ width: "100%" }}
                            options={[
                                { label: "ALL", value: "ALL" },
                                { label: "CONNECTED", value: "CONNECTED" },
                                { label: "BANNED", value: "BANNED" },
                                { label: "MIGRATED", value: "MIGRATED" },
                                { label: "RESTRICTED", value: "RESTRICTED" },
                                { label: "FLAG", value: "FLAG" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Filter by Quality Rating"
                        initialValue={filters.quality_rating}
                    >
                        <Select
                            mode='multiple'
                            value={filters.quality_rating}
                            onChange={(value) => setFilters(prev => ({ ...prev, quality_rating: value }))}
                            style={{ width: "100%" }}
                            options={[
                                { label: "ALL", value: "ALL" },
                                { label: "GREEN", value: "GREEN" },
                                { label: "YELLOW", value: "YELLOW" },
                                { label: "UNKNOWN", value: "UNKNOWN" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Filter by Message Limit"
                        initialValue={filters.tier}
                    >
                        <Select
                            mode='multiple'
                            value={filters.tier}
                            onChange={(value) => setFilters(prev => ({ ...prev, tier: value }))}
                            style={{ width: "100%" }}
                            options={[
                                { label: "ALL", value: "ALL" },
                                { label: "1000 Messages", value: "TIER_1K" },
                                { label: "10000 Messages", value: "TIER_10K" },
                                { label: "100000 Messages", value: "TIER_100K" },
                            ]}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </PageContainer>
    )
}

export default AllAccounts    
