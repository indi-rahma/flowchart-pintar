export const Modules = [
  {
    id: 1,
    title: "Modul 1: Pengantar Algoritma",
    progress: 100,
    status: "completed",
    quizScore: 95,
    items: [
      {
        id: 101,
        label: "Video: Apa itu Algoritma?",
        type: "video",
        content: {
          url: "https://www.youtube.com/embed/xNXxes2eGjs",
          // Tambahkan ini:
          timestamps: [
            { time: "0:00", label: "Pembukaan", seconds: 0 },
            { time: "1:00", label: "Pengertian Algoritma", seconds: 60 },
            { time: "1:23", label: "Simbol-simbol Dasar", seconds: 83 },
            { time: "3:45", label: "Contoh Kasus", seconds: 225 },
          ],
        },
      },
{
  id: 102,
  label: "Materi: Simbol Standar Flowchart",
  type: "materi",
  done: true,
  content: {
  text: `Flowchart adalah diagram yang menampilkan langkah-langkah dalam bentuk simbol visual untuk mempermudah pemahaman alur kerja sebuah sistem secara logis.

⭕ **Terminator (Oval)**
Digunakan untuk menandai titik Start (Mulai) dan End (Selesai). Setiap flowchart wajib diawali dan diakhiri dengan simbol ini.

▱ **Input / Output (Jajar Genjang)**
Digunakan untuk proses penerimaan data (input) atau penampilan data (output). Contohnya membaca data angka atau hasil perhitungan.

▭ **Process (Persegi Panjang)**
Menunjukkan aktivitas pemrosesan yang dilakukan komputer, seperti perhitungan matematika atau pemberian nilai variabel.

♢ **Decision (Belah Ketupat)**
Simbol percabangan untuk pengambilan keputusan. Simbol ini selalu menghasilkan dua kemungkinan jalur: Ya atau Tidak.

⬇ **Flow Line (Panah)**
Berfungsi untuk menghubungkan satu simbol dengan simbol lainnya serta menunjukkan arah aliran instruksi.`
}
},      {
        id: 103,
        label: "Kuis 1: Logika Dasar",
        type: "kuis",
        done: true,
        content: {
          text: "Uji pemahaman modul 1. Pastikan kamu sudah baca materi ciri-ciri algoritma!",
        },
      },
    ],
  },
  {
    id: 2,
    title: "Modul 2: Simbol Flowchart",
    progress: 40,
    status: "current",
    quizScore: 0,
    items: [
      {
        id: 201,
        label: "Video: Tutorial Simbol",
        type: "video",
        done: true,
        content: {
          url: "https://www.youtube.com/embed/yyy",
          text: "Video praktek membuat flowchart menggunakan standar ISO.",
        },
      },
      {
        id: 202,
        label: "Materi: Fungsi Tiap Simbol",
        type: "materi",
        done: false,
        content: {
          text: "Ingat: Oval (Terminator) untuk Start/End, Persegi (Process) untuk perhitungan, dan Belah Ketupat (Decision) untuk percabangan.",
          image: "https://via.placeholder.com/600x400",
        },
      },
      {
        id: 203,
        label: "Kuis 2: Tebak Simbol",
        type: "kuis",
        done: false,
        content: {
          text: "Siapkan mental! Kuis ini akan menguji ingatanmu soal bentuk-bentuk simbol flowchart.",
        },
      },
    ],
  },
];
