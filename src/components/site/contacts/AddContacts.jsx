import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import styles for PhoneInput

const AddContacts = ({ open, setOpen, setContacts }) => {
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");

  const handleOk = async () => {
    try {
      await form.validateFields();
      setContacts(prevContacts => {
        const isDuplicate = prevContacts?.some(
          contact => contact.phone === phone
        );

        if (isDuplicate) {
          message.warning("Contact already exists");
          return prevContacts;
        }

        message.success("Contact added successfully!");
        setPhone("");
        setOpen(false);
        form.resetFields();

        return [...prevContacts, { phone }];
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Add Contact"
      width={320}
      centered
      open={open}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
      okText={"Add"}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Contact Number"
          name="phone"
          rules={[
            {
              required: true,
              message: "Please enter a valid phone number",
            },
            {
              pattern: /^\d+$/, // Ensures only numeric values
              message: "Please enter a valid phone number",
            }
          ]}
        >
          <PhoneInput
            country={"in"}
            value={phone}
            inputStyle={{ width: "100%" }}
            placeholder="Enter Phone Number"
            onChange={(value, country) => {
              const dialCode = country.dialCode;
              const mobileNumber = value.replace(dialCode, "");

              if (mobileNumber.length <= 10) {
                setPhone(dialCode + mobileNumber);
                form.setFieldsValue({ phone: value });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleOk();
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddContacts;
