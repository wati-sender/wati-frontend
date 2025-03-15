import { Card, Col, Flex, Input, Row } from 'antd'
import React, { useState } from 'react'
import { SearchOutlined } from "@ant-design/icons"

const { Search } = Input
const TableActions = ({ buttons, showSearch, search, setSearch }) => {


    return (
        <Card>
            <Row>
                <Col xl={8}>
                    {showSearch && <Search
                        placeholder={"Search"}
                        enterButton={<SearchOutlined />}
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />}
                </Col>
                <Col xl={8} />
                <Col xl={8}>
                    <Flex align="end" gap="small" justify="flex-end">
                        {buttons}
                    </Flex>
                </Col>
            </Row>

        </Card>
    )
}

export default TableActions
