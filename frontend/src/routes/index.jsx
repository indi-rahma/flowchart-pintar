import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

// USER
import Dashboard from "../pages/dashboard/Dashboard";
import ModulSaya from "../pages/siswa/modul-saya/ModulSaya";
import RiwayatKuis from "../pages/riwayat-kuis/RiwayatKuis";
import Pencapaian from "../pages/Pencapaian";
import ContentReader from "../pages/reader/ContentReader";
import FlowEditor from "../components/FlowEditor";
import Pengaturan from "../pages/siswa/pengaturan/Pengaturan";
import Login from "../pages/siswa/Login";
import SignUp from "../pages/siswa/SignUp";
import LatihanFlowchart from "../pages/LatihanFlowchart";




// GURU
import GuruModul from "../pages/guru/GuruModul";
import GuruLesson from "../pages/guru/GuruLesson";
import DashboardGuru from "../pages/guru/Dashboard";
import SiswaGuru from "../pages/guru/Siswa";
import Evaluasi from "../pages/guru/Evaluasi";
import PengaturanGuru from "../pages/guru/PengaturanGuru";
import GuruQuiz from "../pages/guru/GuruQuiz";

// ADMIN
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import KelolaUser from "../pages/admin/KelolaUser";
import KelolaMateri from "../pages/admin/KelolaMateri";
import KelolaGuru from "../pages/admin/KelolaGuru";
import PengaturanAdmin from "../pages/admin/PengaturanAdmin";

// QUIZ
import HalamanKuis from "../pages/quiz/HalamanKuis";
import KuisDragAndDrop from "../pages/quiz/KuisDragAndDrop";

// LAYOUT
import MainLayout from "../layouts/MainLayout";
import GuruLayout from "../layouts/GuruLayout";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* ================= USER ================= */}
      <Route
        element={
          <ProtectedRoute role="siswa">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/modul-saya" element={<ModulSaya />} />
        <Route path="/pencapaian" element={<Pencapaian />} />
        <Route path="/reader/:moduleId/:itemId" element={<ContentReader />} />
        <Route path="/riwayat-kuis" element={<RiwayatKuis />} />
        <Route path="/siswa/pengaturan" element={<Pengaturan />} />
        <Route path="/latihan" element={<FlowEditor />} />

        <Route path="/quiz/:id" element={<HalamanKuis />} />
        <Route path="/siswa/latihan-flowchart" element={<LatihanFlowchart />} />
        <Route path="/quiz-dnd" element={<KuisDragAndDrop />} />
      </Route>

      {/* ================= GURU ================= */}
      <Route
        path="/guru"
        element={
          <ProtectedRoute role="guru">
            <GuruLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardGuru />} />
        <Route path="modul" element={<GuruModul />} />
        <Route path="modul/:id" element={<GuruLesson />} />
        <Route path="siswa" element={<SiswaGuru />} />
        <Route path="evaluasi/:id" element={<Evaluasi />} />
        <Route path="pengaturan" element={<PengaturanGuru />} />
        <Route path="modul/:id/quiz" element={<GuruQuiz />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
  <Route index element={<AdminDashboard />} />
  <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<KelolaUser />} />
        <Route path="guru" element={<KelolaGuru />} />
        <Route path="materi" element={<KelolaMateri />} />
        <Route path="pengaturan" element={<PengaturanAdmin />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;