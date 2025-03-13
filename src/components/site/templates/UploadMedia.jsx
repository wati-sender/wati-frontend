import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'

const UploadMedia = ({
    url,
    handleUpload
}) => {


    return (
        <div>
            <Dragger
                multiple={false}
                showUploadList={false}
                customRequest={handleUpload}>
                {url ? <img src={url} alt="" height={165} /> : <>
                    <Card>
                        <Button type="primary" icon={<UploadOutlined />}>
                            Upload Media
                        </Button>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                            banned files.
                        </p>
                    </Card>
                </>}


            </Dragger>
        </div>
    )
}

export default UploadMedia
