import { Button, Card, Col, Empty, Image, message, Modal, Row, Tabs, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../axios/axiosInstance'
import UploadMedia from './UploadMedia'
import { DeleteOutlined } from '@ant-design/icons'

const MediaModal = ({ open, setOpen, setSelectedImage }) => {

    const [images, setImages] = useState([])
    const [localySelectedImage, setLocalSelectedImage] = useState("")
    const [activeKey, setActiveKey] = useState(1)
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState([])

    const getImages = async () => {
        try {
            setLoading(true)
            const { data } = await axiosInstance.get("media/all")
            if (data?.success) {
                setImages(data.data)
                setLocalSelectedImage(data.data.length > 0 ? data.data[0]?.url : "")
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getImages();
    }, [activeKey])

    const afterUpload = () => {
        getImages()
        setActiveKey(1)
    }

    const handleChoose = () => {
        if (localySelectedImage) {
            setSelectedImage(localySelectedImage)
            setOpen(false)
        } else {
            message.warning("Please select an image")
        }
    }

    const handleDelete = async (media_id) => {
        try {
            setDeleteLoading(prev => [...prev, media_id])
            const { data } = await axiosInstance.post("/media/delete", { media_id })
            if (data?.success) {
                message.success(data?.message)
                getImages()
            }
        } catch (error) {
            message.error(error.message)
        } finally {
            setDeleteLoading(prev => prev.filter(id => id !== media_id))
        }
    }

    const items = [
        {
            key: 1,
            label: "Media",
            children: <Card loading={loading} >
                {images.length === 0 ? <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    styles={{
                        image: {
                            height: 60,
                        },
                    }}
                    description={
                        <Typography.Text>
                            No Media Uploaded
                        </Typography.Text>
                    }
                >
                    <Button onClick={() => setActiveKey(2)} type="primary">Upload Now</Button>
                </Empty> : <Row gutter={[18, 18]} style={{ maxHeight: "50vh", overflow: "auto" }}>
                    {/* <Col xs={24} align="end"><Button>Delete</Button></Col> */}
                    {images?.map((media, index) => (
                        <Col key={index} xs={12} md={8} lg={3} onClick={() => setLocalSelectedImage(media?.url)} >
                            <Button
                                loading={deleteLoading.includes(media?._id)}
                                disabled={deleteLoading.includes(media?._id)}
                                onClick={() => handleDelete(media?._id)}
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                style={{ position: "absolute", right: 15, top: 0, zIndex: 1 }}
                            />
                            {media.resource_type === "video" && <video style={{ borderRadius: "0.5rem", border: `4px solid ${localySelectedImage === media?.url ? "#1677FF" : "transparent"}` }} width="100%">
                                <source src={media?.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>}

                            {media.resource_type === "image" && <Image
                                key={index}
                                src={media?.url}
                                alt="Media not found"
                                width={100}
                                height={100}
                                style={{ borderRadius: "0.5rem", border: `4px solid ${localySelectedImage === media?.url ? "#1677FF" : "transparent"}` }}
                                preview={false}
                            />}

                        </Col>
                    ))}
                </Row>}
            </Card>,
        },
        {
            key: 2,
            label: "Upload",
            children: <UploadMedia afterUpload={afterUpload} />,
        },
    ];


    return (
        <Modal width={1000} title="Choose Media" open={open} onCancel={() => { setOpen(false); setActiveKey(1) }} cancelText="Cancel" okText="Choose" onOk={handleChoose}>
            <Tabs
                defaultActiveKey={activeKey}
                activeKey={activeKey}
                onChange={setActiveKey}
                type="card"
                items={items}
            />
        </Modal>
    )
}

export default MediaModal
