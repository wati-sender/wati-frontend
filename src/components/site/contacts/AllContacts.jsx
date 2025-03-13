import { Button, Card, Dropdown, Flex, message, Popconfirm, Row, Table, Tooltip, Typography, Upload } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { DeleteOutlined, DownOutlined, ImportOutlined, PlusCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import AddContacts from './AddContacts';
import TableActions from '../../common/TableActions';
import * as XLSX from "xlsx";
import axiosInstance from '../../../axios/axiosInstance';
import AddMultipleContacts from './AddMultipleContacts';


const AllContacts = ({
    showDelete,
    showSelect,
    selectedContacts,
    setSelectedContacts
}) => {

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [addMultipleModal, setAddMultipleModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [singleData, setSingleData] = useState({});
    const [contactIds, setContactIds] = useState([]);

    const getContactsData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/contacts/all")
            setContacts(data?.contacts);
        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getContactsData()
    }, [])


    const handleUpload = async (file) => {
        const isExcel =
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel"; // .xls

        if (!isExcel) {
            message.error("Only Excel files (.xls, .xlsx) are allowed!");
            return false;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const contacts = jsonData.map(({ phone, countryCode, name }) => ({ phone, countryCode, name }));

            console.log("contacts", contacts);

            await axiosInstance.post("contacts/add/bulk", { contacts })

            message.success("Contact added successfully!");
            getContactsData()
        };

        reader.readAsBinaryString(file);
        return false;
    };

    const handleSubmit = async (newValue) => {
        await axiosInstance.post("contacts/add/single", newValue);
        message.success("Contacts added successfully!");
        getContactsData()
    }

    const tableButtons = [
        ...(showSelect ? [] : [<Button danger type='primary' disabled={contactIds.length <= 0} onClick={() => handleMultipleDelete(contactIds)}>
            Delete Selected
        </Button>]),
        <Button
            key={"add"}
            icon={<PlusCircleOutlined />}
            onClick={() => setOpen(true)}
        >
            Add
        </Button>,
        <Button
            key={"add-multiple"}
            icon={<PlusCircleOutlined />}
            onClick={() => setAddMultipleModal(true)}
        >
            Add Multiple
        </Button>,
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
                            <a download href='/sample/sample-contacts.xlsx' >Download Sample Excel File</a>
                        ),
                    },
                ],
            }}
            trigger={["hover"]}
        >
            <Button type='primary'><DownOutlined /></Button>
        </Dropdown>
    ]

    const handleMultipleDelete = async (contact_ids) => {
        try {
            setLoading(true)
            const { data } = await axiosInstance.post("/contacts/delete/multiple", { contact_ids })
            if (data.success) {
                message.success(data.message);
                getContactsData();
                setContactIds([])
            }
        } catch (error) {
            message.error(error.message)
        }
    }

    const handleSingleDelete = async (contact_id) => {
        try {
            setLoading(true)
            const { data } = await axiosInstance.post("/contacts/delete/single", { contact_id })
            if (data.success) {
                message.success(data.message);
                getContactsData();
            }
        } catch (error) {
            message.error(error.message)
        }
    }


    const handleCloseModal = () => {
        setOpen(false)
        setIsEdit(false)
        setSingleData({})
    }

    const rowSelection = {
        selectedRowKeys: selectedContacts,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedContacts(selectedRows.map(({ phone, countryCode }) => countryCode + phone))
            console.log("selectedRowKeys", selectedRowKeys);
        },
    };

    const rowSelectionDelete = {
        onChange: (selectedRowKeys) => {
            setContactIds(selectedRowKeys);
        },
    };



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
            title: 'Country Code',
            dataIndex: 'countryCode',
            key: 'countryCode',
            render: (countryCode) => countryCode ?? "-",
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone ?? "-",
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

    const handleMultipleContactsModalClose = () => {
        setAddMultipleModal(false)
    }

    return (
        <PageContainer
            title="Contacts"
        >
            <Flex style={{
                flexDirection: 'column',
                gap: "1rem",
            }}>
                <TableActions buttons={tableButtons} />

                <Card>
                    <Table
                        rowSelection={showSelect ? rowSelection : showDelete && rowSelectionDelete}
                        loading={loading}
                        columns={columns}
                        dataSource={contacts}
                        scroll={{
                            x: 500,
                        }}
                        rowKey={({ phone, countryCode, _id }) => {
                            return showDelete ? _id : countryCode + phone
                        }}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        {"Total"}: <b>{contacts.length}</b>
                                    </Typography.Text>
                                    <Typography.Text>
                                        {showSelect && <>Selected : <b>{selectedContacts.length}</b></>}
                                    </Typography.Text>
                                </Row>
                            );
                        }}
                    />
                </Card>
            </Flex>
            <AddContacts open={open} handleSubmit={handleSubmit} handleCloseModal={handleCloseModal} isEdit={isEdit} singleData={singleData?.record} index={singleData?.index} />
            <AddMultipleContacts open={addMultipleModal} handleClose={handleMultipleContactsModalClose} afterOk={getContactsData} />
        </PageContainer>
    )
}

export default AllContacts
