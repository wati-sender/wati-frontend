
import PropTypes from "prop-types";
import ProLayoutWrapper from "./components/site/prolayout/ProLayout";
import { Route, Routes } from "react-router-dom";
import AllTemplates from "./components/site/templates/AllTemplates";
import AddTemplate from "./components/site/templates/AddTemplate";
import AllAccounts from "./components/site/accounts/AllAccounts";
import Login from "./components/site/Login";
import { useSelector } from "react-redux";
import Campaign from "./components/site/campaign/Campaign";
import Reports from "./components/site/reports/Reports";
import AllContacts from "./components/site/contacts/AllContacts";
import AllCampaign from "./components/site/campaign/AllCampaign";
import Templates from "./components/site/reports/templates/Templates";
import SingleTemplate from "./components/site/templates/SingleTemplate";
import Accounts from "./components/site/reports/accounts/Accounts";
import SingleAccount from "./components/site/reports/accounts/SingleAccount";
import SingleCampaign from "./components/site/campaign/SingleCampaign";

function App() {

  const { isLoggedIn, token } = useSelector(state => state.auth)
  const RouteWrapper = ({ component: Component, ...props }) => {
    RouteWrapper.propTypes = {
      component: PropTypes.elementType.isRequired,
    };
    return (
      <ProLayoutWrapper>
        <Component {...props} />
      </ProLayoutWrapper>
    );
  };

  return (
    <>
      {(isLoggedIn && token) ? (
        <Routes>
          <Route exact path="*" element={<>Not Found</>} />
          <Route exact path="/" element={<RouteWrapper component={AllAccounts} showDelete />} />

          <Route exact path="/templates" element={<RouteWrapper component={AllTemplates} showDelete />} />
          <Route exact path="/templates/:id" element={<RouteWrapper component={SingleTemplate} />} />
          <Route exact path="/templates/add" element={<RouteWrapper component={AddTemplate} />} />

          <Route exact path="/contacts" element={<RouteWrapper component={AllContacts} showDelete />} />4

          <Route exact path="/accounts" element={<RouteWrapper component={AllAccounts} showDelete />} />

          <Route exact path="/campaign" element={<RouteWrapper component={AllCampaign} />} />
          <Route exact path="/campaign/:id" element={<RouteWrapper component={SingleCampaign} />} />
          <Route exact path="/campaign/add" element={<RouteWrapper component={Campaign} />} />

          <Route exact path="/reports" element={<RouteWrapper component={Reports} />} />

          <Route exact path="/reports/accounts" element={<RouteWrapper component={Accounts} />} />
          <Route exact path="/reports/accounts/:id" element={<RouteWrapper component={SingleAccount} />} />
          
          <Route exact path="/reports/templates/:id" element={<RouteWrapper component={SingleTemplate} />} />
          <Route exact path="/reports/templates" element={<RouteWrapper component={Templates} />} />
          {/* <Route exact path="/reports" element={<RouteWrapper component={Reports} />} /> */}

        </Routes>
      ) : (
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="*" element={<>Not Found</>} />
        </Routes>
      )}
    </>
  );
}

export default App;
