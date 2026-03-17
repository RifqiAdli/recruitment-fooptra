export type Language = 'id' | 'en';

export const translations = {
  // Navbar
  'nav.home': { id: 'Beranda', en: 'Home' },
  'nav.jobs': { id: 'Lowongan', en: 'Jobs' },
  'nav.about': { id: 'Tentang', en: 'About' },
  'nav.faq': { id: 'FAQ', en: 'FAQ' },
  'nav.signIn': { id: 'Masuk', en: 'Sign In' },
  'nav.getStarted': { id: 'Daftar', en: 'Get Started' },
  'nav.dashboard': { id: 'Dashboard', en: 'Dashboard' },
  'nav.admin': { id: 'Admin', en: 'Admin' },

  // Homepage Hero
  'home.hero.title1': { id: 'Temukan Peluang ', en: 'Find Your Next ' },
  'home.hero.titleHighlight': { id: 'Karir', en: 'Opportunity' },
  'home.hero.title2': { id: ' di Fooptra', en: ' at Fooptra' },
  'home.hero.subtitle': {
    id: 'Bergabunglah dengan platform food waste tracking berbasis AI. Temukan posisi di engineering, design, data, dan lainnya.',
    en: 'Join the AI-powered food waste tracking platform. Discover roles across engineering, design, data, and more.',
  },
  'home.hero.searchPlaceholder': { id: 'Posisi atau kata kunci...', en: 'Job title or keyword...' },
  'home.hero.searchBtn': { id: 'Cari Lowongan', en: 'Search Jobs' },

  // Homepage Stats
  'home.stats.openPositions': { id: 'Posisi Terbuka', en: 'Open Positions' },
  'home.stats.departments': { id: 'Departemen', en: 'Departments' },
  'home.stats.candidatesPlaced': { id: 'Kandidat Diterima', en: 'Candidates Placed' },
  'home.stats.successRate': { id: 'Tingkat Keberhasilan', en: 'Success Rate' },

  // Homepage Featured
  'home.featured.title': { id: 'Lowongan Unggulan', en: 'Featured Jobs' },
  'home.featured.subtitle': { id: 'Peluang terpilih yang menanti Anda', en: 'Hand-picked opportunities waiting for you' },
  'home.featured.viewAll': { id: 'Lihat semua', en: 'View all' },
  'home.featured.viewAllBtn': { id: 'Lihat Semua Lowongan', en: 'View All Jobs' },

  // Homepage Categories
  'home.categories.title': { id: 'Telusuri Berdasarkan Kategori', en: 'Browse by Category' },
  'home.categories.subtitle': { id: 'Jelajahi posisi di semua departemen', en: 'Explore roles across all departments' },
  'home.categories.job': { id: 'lowongan', en: 'job' },
  'home.categories.jobs': { id: 'lowongan', en: 'jobs' },

  // Homepage How It Works
  'home.howItWorks.title': { id: 'Cara Kerjanya', en: 'How It Works' },
  'home.howItWorks.subtitle': { id: 'Tiga langkah mudah menuju karir impian', en: 'Three simple steps to your next career' },
  'home.step1.title': { id: 'Cari Lowongan', en: 'Search Jobs' },
  'home.step1.desc': { id: 'Telusuri ratusan posisi terbuka di semua departemen.', en: 'Browse through hundreds of open positions across all departments.' },
  'home.step2.title': { id: 'Lamar Online', en: 'Apply Online' },
  'home.step2.desc': { id: 'Kirim lamaran Anda dengan CV dan surat lamaran dalam hitungan menit.', en: 'Submit your application with your CV and cover letter in minutes.' },
  'home.step3.title': { id: 'Bergabung', en: 'Get Hired' },
  'home.step3.desc': { id: 'Ikuti proses wawancara dan mulai karir baru Anda.', en: 'Go through the interview process and start your new career.' },

  // Homepage CTA
  'home.cta.title': { id: 'Siap Memulai Perjalanan Anda?', en: 'Ready to Start Your Journey?' },
  'home.cta.subtitle': {
    id: 'Bergabunglah dengan tim Fooptra dan bantu kurangi pemborosan makanan global dengan teknologi AI.',
    en: 'Join the Fooptra team and help reduce global food waste with AI technology.',
  },
  'home.cta.register': { id: 'Buat Akun', en: 'Create Account' },
  'home.cta.browseJobs': { id: 'Lihat Lowongan', en: 'Browse Jobs' },

  // Jobs Page
  'jobs.title': { id: 'Temukan Posisi Ideal Anda', en: 'Find Your Perfect Role' },
  'jobs.subtitle': { id: 'Jelajahi {count} posisi terbuka', en: 'Explore {count} open positions' },
  'jobs.searchPlaceholder': { id: 'Cari berdasarkan judul atau departemen...', en: 'Search by title or department...' },
  'jobs.clearFilters': { id: 'Hapus semua filter', en: 'Clear all filters' },
  'jobs.category': { id: 'Kategori', en: 'Category' },
  'jobs.employmentType': { id: 'Tipe Pekerjaan', en: 'Employment Type' },
  'jobs.workArrangement': { id: 'Pengaturan Kerja', en: 'Work Arrangement' },
  'jobs.experienceLevel': { id: 'Level Pengalaman', en: 'Experience Level' },
  'jobs.jobsFound': { id: 'lowongan ditemukan', en: 'jobs found' },
  'jobs.noJobs.title': { id: 'Tidak ada lowongan ditemukan', en: 'No jobs found' },
  'jobs.noJobs.subtitle': { id: 'Coba sesuaikan filter atau kata kunci pencarian Anda', en: 'Try adjusting your filters or search query' },
  'jobs.filters': { id: 'Filter', en: 'Filters' },
  'jobs.showResults': { id: 'Tampilkan {count} hasil', en: 'Show {count} results' },

  // About Page
  'about.title': { id: 'Tentang Fooptra', en: 'About Fooptra' },
  'about.subtitle': {
    id: 'Platform pelacakan food waste berbasis AI yang membantu individu, rumah tangga, dan bisnis memantau, menganalisis, dan mengurangi pemborosan makanan.',
    en: 'An AI-powered food waste tracking platform that helps individuals, households, and businesses monitor, analyze, and reduce food waste.',
  },
  'about.story.title': { id: 'Cerita Kami', en: 'Our Story' },
  'about.story.p1': {
    id: 'Fooptra didirikan dengan keyakinan sederhana: sepertiga makanan yang diproduksi di dunia terbuang sia-sia, dan teknologi bisa membantu mengubah hal itu. Kami membangun platform pelacakan food waste berbasis AI yang memungkinkan pengguna mengambil foto sampah makanan mereka — AI kami mengidentifikasi jenis makanan, memperkirakan jumlah, dan menyarankan strategi pencegahan.',
    en: 'Fooptra was founded with a simple belief: one-third of all food produced globally is wasted, and technology can help change that. We built an AI-powered food waste tracking platform that lets users take a photo of their food waste — our AI identifies food types, estimates quantities, and suggests prevention strategies.',
  },
  'about.story.p2': {
    id: 'Pengguna kami melaporkan rata-rata pengurangan 35% sampah makanan rumah tangga dalam tiga bulan pertama. Platform kami menawarkan pelacakan real-time, analitik, dan elemen gamifikasi untuk membangun kebiasaan ramah lingkungan.',
    en: 'Our users report an average 35% reduction in household food waste within the first three months. Our platform offers real-time tracking, analytics, and gamification elements to build eco-conscious habits.',
  },
  'about.values.title': { id: 'Nilai-Nilai Kami', en: 'Our Values' },
  'about.value1.title': { id: 'Berpusat pada Misi', en: 'Mission-Driven' },
  'about.value1.desc': { id: 'Kami berkomitmen mengurangi pemborosan makanan global menggunakan teknologi AI.', en: 'We are committed to reducing global food waste using AI technology.' },
  'about.value2.title': { id: 'Keberlanjutan', en: 'Sustainability' },
  'about.value2.desc': { id: 'Setiap fitur yang kami bangun bertujuan untuk dampak lingkungan yang positif.', en: 'Every feature we build aims for positive environmental impact.' },
  'about.value3.title': { id: 'Inovasi', en: 'Innovation' },
  'about.value3.desc': { id: 'Kami menggunakan AI canggih untuk membuat pelacakan waste lebih cepat dan akurat.', en: 'We use cutting-edge AI to make waste tracking faster and more accurate.' },
  'about.value4.title': { id: 'Komunitas', en: 'Community' },
  'about.value4.desc': { id: 'Kami membangun komunitas yang peduli lingkungan dengan gamifikasi dan leaderboard.', en: 'We build eco-conscious communities through gamification and leaderboards.' },

  // FAQ
  'faq.title': { id: 'Pertanyaan yang Sering Diajukan', en: 'Frequently Asked Questions' },
  'faq.subtitle': { id: 'Temukan jawaban seputar karir di Fooptra', en: 'Find answers about careers at Fooptra' },
  'faq.searchPlaceholder': { id: 'Cari pertanyaan...', en: 'Search questions...' },
  'faq.noResults': { id: 'Tidak ada pertanyaan yang cocok.', en: 'No matching questions found.' },

  // Footer
  'footer.description': {
    id: 'Platform food waste tracking berbasis AI. Bergabunglah dengan tim kami untuk membantu mengurangi pemborosan makanan global.',
    en: 'AI-powered food waste tracking platform. Join our team to help reduce global food waste.',
  },
  'footer.forCandidates': { id: 'Untuk Kandidat', en: 'For Candidates' },
  'footer.browseJobs': { id: 'Lihat Lowongan', en: 'Browse Jobs' },
  'footer.createAccount': { id: 'Buat Akun', en: 'Create Account' },
  'footer.company': { id: 'Perusahaan', en: 'Company' },
  'footer.aboutUs': { id: 'Tentang Kami', en: 'About Us' },
  'footer.contact': { id: 'Kontak', en: 'Contact' },
  'footer.legal': { id: 'Legal', en: 'Legal' },
  'footer.privacy': { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  'footer.terms': { id: 'Syarat & Ketentuan', en: 'Terms of Service' },
  'footer.rights': { id: 'Hak cipta dilindungi.', en: 'All rights reserved.' },

  // Apply Modal
  'apply.title': { id: 'Lamar: {jobTitle}', en: 'Apply: {jobTitle}' },
  'apply.submittedTitle': { id: 'Lamaran Terkirim!', en: 'Application Submitted!' },
  'apply.fullName': { id: 'Nama Lengkap', en: 'Full Name' },
  'apply.email': { id: 'Email', en: 'Email' },
  'apply.uploadCv': { id: 'Upload CV (PDF/DOC, maks 5MB) *', en: 'Upload CV (PDF/DOC, max 5MB) *' },
  'apply.uploadHint': { id: 'Klik untuk upload CV', en: 'Click to upload your CV' },
  'apply.continue': { id: 'Lanjutkan', en: 'Continue' },
  'apply.coverLetter': { id: 'Cover Letter (opsional)', en: 'Cover Letter (optional)' },
  'apply.coverLetterPlaceholder': { id: 'Ceritakan mengapa Anda tertarik dengan posisi ini...', en: 'Tell us why you are interested in this role...' },
  'apply.portfolioUrl': { id: 'Portfolio URL (opsional)', en: 'Portfolio URL (optional)' },
  'apply.expectedSalary': { id: 'Gaji yang Diharapkan (opsional)', en: 'Expected Salary (optional)' },
  'apply.back': { id: 'Kembali', en: 'Back' },
  'apply.submit': { id: 'Kirim Lamaran', en: 'Submit Application' },
  'apply.submitting': { id: 'Mengirim...', en: 'Submitting...' },
  'apply.successTitle': { id: 'Lamaran Anda telah terkirim!', en: 'Your application has been submitted!' },
  'apply.successSubtitle': { id: 'Kami akan menghubungi Anda jika ada perkembangan.', en: 'We will contact you if there are any updates.' },
  'apply.close': { id: 'Tutup', en: 'Close' },
  'apply.error.fileTooLarge': { id: 'File terlalu besar. Maksimum 5MB.', en: 'File is too large. Maximum size is 5MB.' },
  'apply.error.invalidFormat': { id: 'Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.', en: 'Unsupported file format. Please use PDF, DOC, or DOCX.' },
  'apply.error.duplicate': { id: 'Anda sudah melamar untuk posisi ini.', en: 'You have already applied for this role.' },
  'apply.error.failed': { id: 'Gagal mengirim lamaran.', en: 'Failed to submit application.' },
  'apply.success.toast': { id: 'Lamaran berhasil dikirim!', en: 'Application submitted successfully!' },

  // Job Detail
  'jobDetail.notFoundTitle': { id: 'Lowongan Tidak Ditemukan', en: 'Job Not Found' },
  'jobDetail.notFoundSubtitle': { id: 'Posisi yang Anda cari tidak tersedia.', en: "The position you're looking for doesn't exist." },
  'jobDetail.location': { id: 'Lokasi', en: 'Location' },
  'jobDetail.salary': { id: 'Gaji', en: 'Salary' },
  'jobDetail.openings': { id: 'Kebutuhan', en: 'Openings' },
  'jobDetail.posted': { id: 'Diposting', en: 'Posted' },
  'jobDetail.description': { id: 'Deskripsi Pekerjaan', en: 'Job Description' },
  'jobDetail.responsibilities': { id: 'Tanggung Jawab', en: 'Responsibilities' },
  'jobDetail.requirements': { id: 'Kualifikasi', en: 'Requirements' },
  'jobDetail.niceToHave': { id: 'Nilai Tambah', en: 'Nice to Have' },
  'jobDetail.benefits': { id: 'Benefit & Fasilitas', en: 'Benefits & Perks' },
  'jobDetail.requiredSkills': { id: 'Keahlian yang Dibutuhkan', en: 'Required Skills' },
  'jobDetail.deadline': { id: 'Batas akhir', en: 'Deadline' },
  'jobDetail.peopleViewed': { id: '{count} orang melihat lowongan ini', en: '{count} people viewed this job' },
  'jobDetail.previewAlt': { id: 'Banner lowongan {title}', en: '{title} job banner' },
  'jobDetail.linkCopied': { id: 'Link berhasil disalin!', en: 'Link copied!' },
  'jobDetail.cvPreviewUnavailable': { id: 'Pratinjau tidak tersedia untuk format file ini.', en: 'Preview is not available for this file type.' },

  // Common
  'common.applyNow': { id: 'Lamar Sekarang', en: 'Apply Now' },
  'common.saveJob': { id: 'Simpan Lowongan', en: 'Save Job' },
  'common.saved': { id: 'Tersimpan', en: 'Saved' },
  'common.copyLink': { id: 'Salin Link', en: 'Copy Link' },
  'common.backToJobs': { id: 'Kembali ke Lowongan', en: 'Back to Jobs' },
  'common.signOut': { id: 'Keluar', en: 'Sign Out' },
} as const;

export type TranslationKey = keyof typeof translations;
