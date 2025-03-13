import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import React from 'react';
import axiosInstance from '../../axios/axiosInstance';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/auth/authSlice';

const { Title, Text } = Typography;

const Login = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const handleLogin = async (userData) => {
        try {
            const { data } = await axiosInstance.post("auth/login", userData);

            if (data.success) {
                message.success("Login Successful");
                dispatch(login(data.token));
            } else {
                message.error(data.message);
            }
        } catch (error) {
            if (error.errorFields) {
                message.error("Please fill all required fields.");
            } else if (error.response) {
                message.error("Failed to login, please try again");
            } else {
                message.error("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "98vh",
            backgroundColor: "#E8F5E9"
        }}>
            <Card style={{
                width: "350px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: 20,
                textAlign: 'center',
            }}>
                <div style={{ marginBottom: "20px" }}>
                    <WhatsAppOutlined style={{ fontSize: '48px', color: '#128C7E' }} />
                    <Title level={2} style={{ color: '#075E54', marginTop: "10px" }}>Wati-Sender Bot</Title>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={() => {
                        form.validateFields().then((values) => handleLogin(values));
                    }}
                >
                    <Form.Item
                        label={<Text strong>Username</Text>}
                        name="username"
                        rules={[{ required: true, message: "Please enter Username" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Enter your username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Password</Text>}
                        name="password"
                        rules={[{ required: true, message: "Please enter Password" }]}
                    >
                        <Input.Password
                            prefix={<KeyOutlined />}
                            placeholder="Enter your password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType='submit'
                            style={{
                                width: "100%",
                                borderRadius: "8px"
                            }}
                        >
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
