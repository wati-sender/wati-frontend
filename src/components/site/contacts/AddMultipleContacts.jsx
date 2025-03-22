import { Modal, Table, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';

const AddMultipleContacts = ({ open, setOpen, setContactsData }) => {
    const [enteredContactString, setEnteredContactString] = useState("");
    const [contacts, setContacts] = useState([]);
    const [errors, setErrors] = useState([]);

    const handleInputChange = (e) => {
        const { value } = e.target;
        setEnteredContactString(value);

        if (!value.trim()) {
            setContacts([]);
            return;
        }

        const rows = value
            .split(/[\n,]+/)
            .flatMap((line) => line.trim().split(/\s+/))
            .filter(Boolean)
            .map((phone) => ({
                phone,
            }));

        setContacts(rows);
        setErrors([]);
    };


    // Validation functions
    const isInvalidPhone = (phone) => !/^\d+$/.test(phone);

    const handleOk = async () => {
        setContactsData(prev => {
            const existingContacts = new Set(prev.map(contact => contact.phone));

            const uniqueContacts = contacts
                .filter(contact => contact.phone && contact.phone.toString().length === 12) 
                .filter(contact => {
                    if (existingContacts.has(contact.phone)) {
                        return false;
                    }
                    existingContacts.add(contact.phone);
                    return true;
                });

            if (uniqueContacts.length > 0) {
                message.success("Contacts added successfully");
            } else {
                message.info("No new contacts were added (all duplicates or invalid).");
            }

            setErrors([]);
            setEnteredContactString("");
            setOpen(false);

            return [...prev, ...uniqueContacts];
        });

        setContacts([]);
    };


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
            render: (phone) => (
                <span style={{ color: isInvalidPhone(phone) ? "red" : "inherit" }}>
                    {phone || ""}
                </span>
            ),
        },
    ];

    return (
        <Modal
            title="Add Contact"
            centered
            open={open}
            onOk={handleOk}
            onCancel={() => setOpen(false)}
            okText={"Add"}
            cancelText="Cancel"
        >
            <TextArea
                rows={4}
                value={enteredContactString}
                onChange={handleInputChange}
                placeholder="Enter contacts in format: Name, Country Code, Phone"
            />
            <Table
                columns={columns}
                dataSource={contacts}
                rowKey={(record, index) => index}
                pagination={false}
                scroll={{ y: 600 }}
            />
        </Modal>
    );
};

export default AddMultipleContacts;
