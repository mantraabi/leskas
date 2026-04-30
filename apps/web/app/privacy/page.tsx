import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali
        </Link>

        <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1B19]">Kebijakan Privasi</h1>
              <p className="text-xs text-[#9CA3AF]">Terakhir diperbarui: April 2026</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-sm text-[#6B6860] leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">1. Data yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data yang kamu berikan secara langsung, meliputi:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Nama lengkap dan alamat email saat registrasi</li>
                <li>Nomor WhatsApp untuk keperluan notifikasi</li>
                <li>Data siswa yang kamu masukkan (nama, kontak orang tua, mata pelajaran)</li>
                <li>Data keuangan (tagihan, pembayaran, jadwal)</li>
                <li>Bukti pembayaran langganan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">2. Penggunaan Data</h2>
              <p>Data yang kami kumpulkan digunakan untuk:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Menyediakan dan meningkatkan layanan LesKas</li>
                <li>Mengirim notifikasi terkait tagihan dan langganan</li>
                <li>Memproses pembayaran dan verifikasi langganan</li>
                <li>Memberikan dukungan teknis kepada pengguna</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">3. Keamanan Data</h2>
              <p>Data kamu disimpan dengan aman menggunakan layanan Supabase yang dilengkapi enkripsi. Kami menerapkan Row Level Security (RLS) sehingga setiap guru hanya bisa mengakses data miliknya sendiri.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">4. Berbagi Data</h2>
              <p>Kami tidak menjual, menyewakan, atau membagikan data pribadi kamu kepada pihak ketiga untuk tujuan komersial. Data hanya dibagikan kepada penyedia layanan teknis (Supabase, Fonnte) yang diperlukan untuk menjalankan aplikasi.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">5. Hak Pengguna</h2>
              <p>Kamu berhak untuk:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Mengakses dan mengunduh data kamu</li>
                <li>Memperbarui atau mengoreksi data yang tidak akurat</li>
                <li>Menghapus akun dan seluruh data kamu</li>
                <li>Menolak penggunaan data untuk keperluan tertentu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">6. Cookie</h2>
              <p>LesKas menggunakan cookie hanya untuk keperluan autentikasi dan menjaga sesi login kamu. Kami tidak menggunakan cookie untuk pelacakan iklan.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">7. Perubahan Kebijakan</h2>
              <p>Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan diberitahukan melalui email atau notifikasi di aplikasi.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">8. Kontak</h2>
              <p>Pertanyaan mengenai privasi dapat disampaikan ke <span className="text-brand">support@leskas.app</span>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}