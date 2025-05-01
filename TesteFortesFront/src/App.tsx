import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/common/Layout";
import Dashboard from "./pages/Dashboard";
import CourseList from "./components/courses/CourseList";
import StudentList from "./components/students/StudentList";
import EnrollmentList from "./components/enrollments/EnrollmentList";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/enrollments" element={<EnrollmentList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
