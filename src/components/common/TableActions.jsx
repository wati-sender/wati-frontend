import { Card, Flex } from 'antd'
import React, { useState } from 'react'


const TableActions = ({ buttons }) => {


    return (
        <Card>
            <Flex align="end" gap="small" justify="flex-end">
                {buttons}
            </Flex>
        </Card>
    )
}

export default TableActions
