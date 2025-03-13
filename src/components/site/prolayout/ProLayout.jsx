/* eslint-disable react/prop-types */

import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { ProConfigProvider, ProLayout } from "@ant-design/pro-components";
import defaultProps from "./DefaultProps";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, ConfigProvider, Dropdown, message, Tooltip } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/auth/authSlice";
import axiosInstance from "../../../axios/axiosInstance";

function ProLayoutWrapper({ children }) {
  const [pathname, setPathname] = useState("/welcome");
  const [loading, setloading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleVerifyUser = async () => {
    try {
      setloading(true);

      const { data } = await axiosInstance.get("/auth/verify");
      if (!data.success) {
        dispatch(logout())
      }
    } catch (error) {
      message.error(error.message)
    } finally {
      setloading(false);
    }
  }

  useEffect(() => {
    handleVerifyUser();
  }, [dispatch])

  const props = {
    ...defaultProps,
    location: {
      pathname,
    },
    collapsed,
    fixSiderbar: true,
    collapsedButtonRender: false,
    menuItemRender: (item, dom) => (
      <a
        onClick={() => {
          setPathname(item.path || "/");
          navigate(dom.key);
          setPathname(dom.key);
        }}
      >
        {dom}
      </a>
    ),
  };

  return (
    <ProConfigProvider hashed={false} locale="en">
      <ConfigProvider
        locale="en"
        getTargetContainer={() => {
          return (
            document.getElementById("test-pro-layout") || document.body
          );
        }}
      >
        <ProLayout
          breadcrumbRender={false}
          {...props}
          layout="mix"
          onCollapse={setCollapsed}
          logo={<>Wati-Sender Bot</>}
          headerTitleRender={(logo, title, _) => {
            const defaultDom = (
              <Tooltip arrow={false} title={logo}>
                <Link to={"/"}>{logo}</Link>
              </Tooltip>
            );
            if (typeof window === "undefined") return defaultDom;
            if (document.body.clientWidth < 1400) {
              return defaultDom;
            }
            if (_.isMobile) return defaultDom;
            return (
              <>
                {defaultDom}
                {/* <MenuCard /> */}
              </>
            );
          }}
          avatarProps={{
            src: <Avatar icon={<UserOutlined />} />,
            size: "small",
            render: (props, dom) => {
              return (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "logout",
                        icon: <LogoutOutlined />,
                        label: "Logout",
                        onClick: () => {
                          dispatch(logout())
                          navigate("/");
                        },
                      },
                    ],
                  }}
                >
                  {dom}
                </Dropdown>
              );
            },
          }}
          headerContentRender={() => {
            return (
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            );
          }}
          loading={loading}
        >
          {children}
        </ProLayout>
      </ConfigProvider>
    </ProConfigProvider>
  );
}

export default ProLayoutWrapper;
