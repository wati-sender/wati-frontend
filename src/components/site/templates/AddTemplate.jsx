import React, { useEffect, useState } from "react";
import { Button, Card, Col, Flex, Form, Input, message, Row, Select, Space, Typography } from "antd";
import Buttons from "./Buttons";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axios/axiosInstance";
import UploadMedia from "./UploadMedia";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import MediaModal from "./MediaModal";

const AddTemplate = () => {
    const navigate = useNavigate()
    const [buttons, setButtons] = useState([
        {
            type: "quick_reply",
            parameter: {
                text: "",
                urlType: "none",
            }
        }
    ])
    const [imageUrl, setImageUrl] = useState("");
    const [mediaModalOpen, setMediaModalOpen] = useState(false)
    const [startAccountIndex, setStartAccountIndex] = useState(null)
    const [endAccountIndex, setEndAccountIndex] = useState(null)
    const [templateType, setTemplateType] = useState("rich_card")
    const { Text } = Typography
    const [form] = Form.useForm();


    useEffect(() => {
        const initValues = buttons?.reduce((acc, button, index) => {
            acc[`button_type_${index}`] = button?.type;
            acc[`button_title_${index}`] = button?.parameter?.text;
            acc[`button_phone_${index}`] = button?.parameter?.phoneNumber;
            acc[`button_url_${index}`] = button?.parameter?.url;
            return acc;
        }, {});
        form.setFieldsValue(initValues);
    }, [buttons?.length]);

    const handleCreateTemplate = async (type) => {
        try {
            const buttonsType = buttons.reduce((acc, curr) => {
                if (curr.type === "quick_reply" && !acc.includes("quick_reply")) acc.push("quick_reply");

                if ((curr.type === "call" || curr.type === "url") && !acc.includes("call_to_action")) acc.push("call_to_action");

                return acc;
            }, [])
                .sort((a, b) => a === "quick_reply" ? -1 : 1)
                .join("_and_");
            const formData = await form.validateFields();

            const headerData = {
                "rich_card": {
                    type: "image",
                    link: imageUrl
                },
                "text_with_button": {
                    type: "text",
                    text: formData.text
                }
            }

            let payload = {
                id: "",
                type: "template",
                category: "MARKETING",
                subCategory: "STANDARD",
                buttonsType,
                buttons: buttons,
                footer: formData.footer,
                header: headerData[templateType],
                elementName: formData.template_name,
                body: formData.body,
                language: "en",
            };

            const { data } = await axiosInstance.post("/templates/create/bulk", { template: payload, "startAccountIndex": startAccountIndex, "endAccountIndex": endAccountIndex });

            if (data.success) {
                message.success(data?.message);
                navigate("/templates")
            } else {
                message.error(data?.message ?? "Failed to create templates for all accounts!");
            }
        } catch (error) {
            if (error.errorFields) {
                message.error("Please fill in all required fields.");
            } else if (error.response) {
                message.error("Something went wrong!");
            } else {
                message.error("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleAddButton = () => {
        if (buttons?.length === 3) {
            message.warning("Cannot add more than 3 buttons");
        } else {
            setButtons((prev) => [
                ...prev,
                {
                    type: "quick_reply",
                    parameter: {
                        text: "",
                        urlType: "none",
                    }
                },
            ]);
        }
    };


    const handleButtonFieldsChange = (index, type, text, extra) => {
        const updatedButtons = [...buttons];

        updatedButtons[index] = {
            type,
            parameter: {
                text: text,
                urlType: type === "url" ? "static" : "none",
                ...(type === "call" && { phoneNumber: extra }),
                ...(type === "url" && { url: extra })
            }
        };

        setButtons(updatedButtons);
    };


    const handleDeleteButton = (index) => {
        if (buttons.length === 1) return;
        const updatedButtons = buttons?.filter((_, i) => i !== index);
        setButtons(updatedButtons);
    };


    return (
        <PageContainer
            title="Create template"
        >
            <ProCard>
                <Form form={form} layout="vertical">
                    <Flex justify="end" gap={15}>
                        <Form.Item
                            layout="horizontal"
                            style={{ marginBottom: "15px" }}
                            name="template_type"
                            label="Type"
                        >
                            <Select
                                defaultValue="rich_card"
                                style={{ width: 150 }}
                                options={[
                                    { label: "Rich Card", value: "rich_card" },
                                    { label: "Text With Button", value: "text_with_button" }
                                ]}
                                onChange={(value) => setTemplateType(value)}
                            />
                        </Form.Item>

                        <Form.Item
                            layout="horizontal"
                            style={{ marginBottom: "15px", width: 400 }}
                            name={"template_name"}
                            label="Template Name"
                            rules={[
                                {
                                    required: true,
                                    type: "string",
                                    message: "Please enter template name",
                                },
                                { max: 25, message: "Title must be within 25 characters" },
                            ]}
                        >
                            <Input placeholder="Template Name" />
                        </Form.Item>
                    </Flex>
                    <Col>

                        {/* Media upload */}

                        <Row gutter={[16, 24]}>
                            {templateType === "rich_card" && (
                                <Col md={12} style={{ textAlign: "center" }}>
                                    <Form.Item
                                        style={{ marginBottom: "15px" }}
                                        name={"image_url"}
                                        label={"Image Url"}
                                        rules={[
                                            {
                                                required: true,
                                                type: "string",
                                                message: "Please enter valid url",
                                            },
                                        ]}
                                    >
                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <Card style={{ height: 205, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                {imageUrl ?
                                                    <img src={imageUrl} alt="" height={165} /> : <Button onClick={() => setMediaModalOpen(true)} type="primary" icon={<UploadOutlined />}>
                                                        Upload Media
                                                    </Button>}
                                                {imageUrl && <Button
                                                    onClick={() => setImageUrl("")}
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    style={{ position: "absolute", right: 10, top: 10 }}
                                                />}
                                            </Card>
                                            <Text>OR</Text>
                                            <Input
                                                placeholder="Image Url"
                                                maxLength={200}
                                                showCount
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                            />
                                        </Space>
                                    </Form.Item>
                                </Col>
                            )}

                            {templateType === "text_with_button" && <Col md={24}>
                                <Form.Item
                                    name={"text"}
                                    label={"Title"}
                                    rules={[
                                        {
                                            required: true,
                                            type: "string",
                                            message: "Please enter Title",
                                        },
                                        { max: 60, message: "Title must be within 60 characters" },
                                    ]}
                                >
                                    <Input
                                        placeholder="Enter Title"
                                        maxLength={60}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>}

                            <Col md={templateType === "rich_card" ? 12 : 24}>
                                <Form.Item
                                    name={"body"}
                                    label={"Message"}
                                    rules={[
                                        {
                                            required: true,
                                            type: "string",
                                            message: "Please enter description",
                                        },
                                        { max: 999, message: "Description must be within 999 characters" },
                                    ]}
                                >
                                    <Input.TextArea
                                        rows={templateType === "rich_card" ? 12 : 6}
                                        placeholder="Message"
                                        maxLength={999}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>

                            <Col md={24}>
                                <Form.Item
                                    style={{ marginBottom: "15px" }}
                                    name={"footer"}
                                    label={<Text>
                                        Footer <small style={{ color: "gray" }}>(optiona)l</small>
                                    </Text>}
                                >
                                    <Input placeholder="Footer" />
                                </Form.Item>
                            </Col>
                        </Row>

                    </Col>

                    <Buttons
                        handleAddButton={handleAddButton}
                        buttons={buttons}
                        handleButtonFieldsChange={handleButtonFieldsChange}
                        handleDeleteButton={handleDeleteButton}
                        form={form}
                        maxLength={3}
                    />
                    <Flex gap={15} style={{ marginTop: 25, }} justify="flex-end">
                        <Form.Item
                            name={"start account number"}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter start account number",
                                }
                            ]}
                        >
                            <Input size="default size" onChange={e => setStartAccountIndex(e.target.value)} type="number" style={{ width: '100%' }} placeholder="Start Account Number" />
                        </Form.Item>
                        <Form.Item
                            name={"end account number"}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter end account number",
                                }
                            ]}
                        >
                            <Input size="default size" onChange={e => setEndAccountIndex(e.target.value)} type="number" style={{ width: '100%' }} placeholder="End Account Number" />
                        </Form.Item>

                        <Button
                            type="primary"
                            style={{
                                padding: "10px 30px",
                            }}
                            onClick={() => handleCreateTemplate("bulk")}
                        >
                            Create For All Accounts
                        </Button>

                    </Flex>

                </Form>

                <MediaModal open={mediaModalOpen} setOpen={setMediaModalOpen} setSelectedImage={setImageUrl} />
            </ProCard>
        </PageContainer>
    );
};

export default AddTemplate;
