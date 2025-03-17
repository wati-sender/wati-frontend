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
    selectedContacts = [],
    setSelectedContacts
}) => {

    const [contacts, setContacts] = useState(selectedContacts);
    const [open, setOpen] = useState(false);
    const [addMultipleModal, setAddMultipleModal] = useState(false);

    useEffect(() => {
        if (typeof setSelectedContacts === 'function') setSelectedContacts(contacts)
    }, [contacts])

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

            const newContacts = jsonData.map(({ phone }) => ({ phone }));

            setContacts(prev => {
                const existingContacts = new Set(prev.map((contact) => contact.phone));

                const uniqueContacts = newContacts.filter(contact => {
                    if (existingContacts.has(contact.phone)) {
                        return false; 
                    }
                    existingContacts.add(contact.phone);
                    return true; 
                });

                if (uniqueContacts.length > 0) {
                    message.success("Contacts added successfully!");
                } else {
                    message.info("No new contacts were added (all duplicates).");
                }

                return [...prev, ...uniqueContacts];
            });
        };

        reader.readAsBinaryString(file);
        return false;
    };

    const tableButtons = [
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

    const columns = [
        {
            title: "SN",
            width: 60,
            key: "sn",
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone ?? "-",
        },
    ];

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
                        columns={columns}
                        dataSource={contacts}
                        scroll={{
                            x: 500,
                        }}
                        footer={() => {
                            return (
                                <Row >
                                    <Typography.Text style={{ marginRight: 10 }}>
                                        {"Total"}: <b>{contacts.length}</b>
                                    </Typography.Text>
                                </Row>
                            );
                        }}
                    />
                </Card>
            </Flex>
            <AddContacts open={open} setOpen={setOpen} setContacts={setContacts} />
            <AddMultipleContacts open={addMultipleModal} setOpen={setAddMultipleModal} setContactsData={setContacts} />
        </PageContainer>
    )
}

export default AllContacts
