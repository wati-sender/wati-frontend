import { Modal, Table, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const AddMultipleContacts = ({ open, handleClose, afterOk }) => {
    const [enteredContactString, setEnteredContactString] = useState("");
    const [contacts, setContacts] = useState([]);
    const [errors, setErrors] = useState([]);

    // Define the fixed phone number length (10 digits)
    const fixedPhoneLength = 10;

    const handleInputChange = (e) => {
        const { value } = e.target;
        setEnteredContactString(value);

        if (!value) {
            setContacts([]);
            return;
        }

        // const rows = value.split("\n").map((line) => {
        //     const values = line.split(" ").map((item) => item.trim());
        //     return {
        //         countryCode: values[0] || "",
        //         phone: values[1] || "",
        //     };
        // });

        // const rows = value.split("\n").map((line) => {
        //     const delimiter = line.includes(",") ? "," : " ";
        //     const values = line.split(delimiter).map((item) => item.trim());
        //     return {
        //         countryCode: values[0] || "",
        //         phone: values[1] || "",
        //     };
        // }); 

        const rows = value.split("\n").map((line) => {
            const values = line.split(/,|\s+/).map((item) => item.trim());
            return {
                countryCode: values[0] || "",
                phone: values[1] || "",
            };
        });

        setContacts(rows);
        setErrors([]);
    };

    // Validation functions
    const isInvalidCountryCode = (code) => !/^\d+$/.test(code);
    const isInvalidPhone = (phone) => !/^\d+$/.test(phone) || phone.length !== fixedPhoneLength;

    const validateContacts = () => {
        let validationErrors = [];

        contacts.forEach((contact, index) => {
            let rowErrors = [];
            if (isInvalidCountryCode(contact.countryCode)) rowErrors.push("Country Code must be numeric");
            if (isInvalidPhone(contact.phone)) rowErrors.push(`Phone Number must be exactly ${fixedPhoneLength} digits`);

            if (rowErrors.length) {
                validationErrors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`);
            }
        });

        if (validationErrors.length) {
            setErrors(validationErrors);
            message.error(validationErrors.join(" | "));
            return false;
        }

        return true;
    };

    const handleOk = async () => {
        if (!validateContacts()) {
            return;
        }
        if (contacts.length > 0) {
            console.log("Contacts added:", contacts);

            const { data } = await axiosInstance.post("contacts/add/bulk", { contacts });
            if (data.status) {
                handleClose()
                message.success(data.message);
                setEnteredContactString("");
                setContacts([])
                await afterOk();
            }

        } else {
            handleClose();
        }
    };

    const columns = [
        {
            title: "SN",
            width: 60,
            key: "sn",
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Country Code',
            dataIndex: 'countryCode',
            key: 'countryCode',
            render: (countryCode) => (
                <span style={{ color: isInvalidCountryCode(countryCode) ? "red" : "inherit" }}>
                    {countryCode || ""}
                </span>
            ),
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
            onCancel={handleClose}
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
            />
        </Modal>
    );
};

export default AddMultipleContacts;
