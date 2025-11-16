import { Routes, Route } from 'react-router-dom';
import App from './App';
import AuthLayout from './components/AuthLayout';
import NotFound from './components/NotFound';
import PersistLogin from './components/PersistLogin';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Authorization from './components/Authorization';
import UnAuthorized from './components/UnAuthorized';
import { ExamDashboard, ExamsList, QuestionBankPage, TeacherDashboard, TeacherProfile, ToolsPage } from "./pages/Teacher";
import { StudentDashboard, StudentProfile, ResultHistory } from "./pages/Student";

// ✅ Import new components
import QuizPage from "./pages/QuizPage";
import AnalysisPage from "./pages/AnalysisPage";
import StudentExamsList from './pages/Student/StudentExamList';

function AppRouter() {
    return (
        <Routes>
            <Route element={<PersistLogin />}>
                {/* Protected Routes */}
                <Route element={<AuthLayout authenticated={true} />}>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />

                        {/* Student routes */}
                        <Route path="student" element={<Authorization role="student" />}>
                            <Route path='profile' element={<StudentProfile />} />
                            <Route path="exams" element={<StudentExamsList />} />
                            <Route path="dashboard" element={<ResultHistory />} />
                            {/* ✅ Exam routes */}
                            <Route path='exam/:examId' element={<QuizPage />} />
                            <Route path='analysis/:examId' element={<AnalysisPage />} />
                            <Route path='tools' element={<ToolsPage />} />
                        </Route>

                        {/* Teacher routes */}
                        <Route path="teacher" element={<Authorization role="teacher" />}>
                            <Route path='question-bank' element={<QuestionBankPage />} />
                            <Route path='dashboard' element={<TeacherDashboard />} />
                            <Route path="exam/:examId" element={<ExamDashboard />} />
                            <Route path="exams" element={<ExamsList />} />
                            <Route path="tools" element={<ToolsPage />} />
                            <Route path="profile" element={<TeacherProfile />} />
                        </Route>

                        {/* Parent routes */}
                        <Route path="parent" element={<Authorization role="parent" />}>
                        </Route>
                    </Route>
                </Route>

                {/* Public Routes */}
                <Route element={<AuthLayout authenticated={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>

                <Route path="/unauthorized" element={<UnAuthorized />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;
