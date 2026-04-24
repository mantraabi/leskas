import { StudentForm } from "../../../../components/students/student-form";

export default function NewStudentPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1C1B19]">Tambah Siswa</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">
          Isi data siswa baru kamu
        </p>
      </div>
      <StudentForm />
    </div>
  );
}