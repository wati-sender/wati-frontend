import { Button, Card, Form, Input } from 'antd'
import React from 'react'

const BasicConfiguration = ({
    campaignName,
    setCampaignName,
}) => {

    return (
        <Card title="Basic Configuration">
            <Form layout="vertical">
                <Form.Item
                    label="Campaign Name"
                    name="name"
                    required
                    initialValue={campaignName}
                >
                    <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Campaign Name" />
                </Form.Item>
            </Form>

        </Card>
    )
}

export default BasicConfiguration
