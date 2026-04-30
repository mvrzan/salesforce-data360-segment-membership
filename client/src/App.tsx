import { Routes, Route, Navigate } from "react-router";
import Layout from "./layout/Layout";
import SegmentsPage from "./pages/SegmentsPage";
import IndividualsPage from "./pages/IndividualsPage";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<SegmentsPage />} />
      <Route path="/segments/:segmentApiName" element={<IndividualsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
