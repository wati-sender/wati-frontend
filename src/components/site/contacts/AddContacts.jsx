import { Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import styles for PhoneInput

const AddContacts = ({ open, handleCloseModal, handleSubmit, isEdit, singleData }) => {
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    if (isEdit && singleData) {
      form.setFieldsValue({
        name: singleData.name,
      });

      // Extract only the mobile number (remove country code)
      const cleanedNumber = singleData.phone?.replace(`+${singleData.countryCode}`, "");

      setPhone(cleanedNumber);
      setCountryCode(singleData.countryCode || "91");
    }
  }, [isEdit, singleData, form]);

  const handleOk = async () => {
    try {
      const formData = await form.validateFields();

      const newValue = {
        ...formData,
        phone,
        countryCode
      };

      handleSubmit(newValue);
      form.resetFields();
      handleCloseModal();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Add Contact"
      centered
      open={open}
      onOk={handleOk}
      onCancel={handleCloseModal}
      okText={isEdit ? "Update" : "Add"}
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
          ]}
        >
          <PhoneInput
            country={"in"} 
            value={`${countryCode}${phone}`} 
            inputStyle={{ width: "100%" }}
            placeholder="Enter Phone Number"
            onChange={(value, country) => {
              const dialCode = country.dialCode;
              const mobileNumber = value.replace(dialCode, "");

              setPhone(mobileNumber);
              setCountryCode(dialCode);
              form.setFieldsValue({ phone: value });
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddContacts;
