// Nguồn nội dung duy nhất của thiệp. Sửa thông tin ở đây, không sửa trong HTML.
// Dữ liệu hiện tại là dữ liệu mẫu (demo chungdoi.com) — thay bằng thông tin thật trước khi gửi thiệp.
window.WEDDING = {
  bride: {
    shortName: 'Ngọc Ánh',
    fullName: 'Lê Ngọc Ánh',
    birthOrder: 'Út Nữ',
    parentTitle: 'Ông Bà',
    father: 'Lê Văn Khoa',
    mother: 'Phạm Thị Kim Oanh',
    address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
  },
  groom: {
    shortName: 'Thế Bảo',
    fullName: 'Trần Thế Bảo',
    birthOrder: 'Út Nam',
    parentTitle: 'Ông Bà',
    father: 'Trần Văn Tuấn',
    mother: 'Lê Thị Hương',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  },
  announcement: ['TRÂN TRỌNG BÁO TIN', 'LỄ THÀNH HÔN CỦA CON CHÚNG TÔI'],

  date: '2026-05-03',          // ngày cưới (dương lịch)
  lunar: 'Tức ngày 17 tháng 3 năm Bính Ngọ', // ghi tay, không tự tính
  ceremonyTime: '09:00',       // lễ thành hôn tại tư gia
  ceremonyHeader: 'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA',
  receptionTime: '17:30',      // đón khách
  banquetTime: '18:00',        // khai tiệc
  partyEndTime: '21:00',

  venue: {
    name: 'White Palace Convention Center',
    address: 'White Palace Convention Center, 194 Hoàng Văn Thụ, Phú Nhuận, Hồ Chí Minh',
  },

  timeline: [
    ['17:30', 'Đón khách'],
    ['18:30', 'Khai tiệc'],
    ['18:45', 'Rót rượu, cắt bánh'],
    ['19:00', 'Phục vụ món chính'],
    ['21:00', 'Kết thúc tiệc'],
  ],
  dresscode: ['#651212', '#8D3A3A', '#FFB2B2'],

  // object-position giữ khuôn mặt khi crop
  album: [
    ['public/images/album/01.webp', '50% 28%'],
    ['public/images/album/02.webp', '50% 20%'],
    ['public/images/album/03.webp', '50% 18%'],
    ['public/images/album/04.webp', '50% 16%'],
    ['public/images/album/05.webp', '50% 20%'],
    ['public/images/album/06.webp', '50% 15%'],
  ],

  // Số tài khoản '0000000000' = chưa có → hiển thị "Đang cập nhật" thay cho QR.
  gifts: [
    { side: 'Nhà gái', bankName: 'Vietcombank', bin: '970436', accountName: 'LE NGOC ANH', accountNumber: '0000000000' },
    { side: 'Nhà trai', bankName: 'VietinBank', bin: '970415', accountName: 'TRAN THE BAO', accountNumber: '0000000000' },
  ],

  inviteMessage: 'đến dự buổi tiệc chung vui cùng gia đình',
  defaultGuest: 'Quý khách',
  thankYou: 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!',
  music: 'public/audio/music.m4a', // nén từ docs/audio/nhacnen.mp3 (AAC 96kbps). Để trống → ẩn nút nhạc

  sampleWishes: [
    { name: 'An', msg: 'Chúc Thế Bảo và Ngọc Ánh luôn khỏe mạnh, bình an và tràn đầy niềm vui, để cùng nhau xây dựng một tương lai tốt đẹp!', at: '2026-01-24T22:31:22' },
    { name: 'Ngọc Quyên', msg: 'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường', at: '2025-12-19T10:07:42' },
    { name: 'Chị Tâm', msg: 'Về chung một nhà, cùng nhau già đi nhé', at: '2025-12-19T10:06:10' },
    { name: 'Phúc Hân', msg: 'Kính chúc tân lang tân nương trăm năm hạnh phúc', at: '2025-12-19T10:05:35' },
  ],
  wishSuggestions: [
    'Chúc hai bạn trăm năm hạnh phúc, sớm sinh quý tử!',
    'Chúc tân lang tân nương bách niên giai lão, mãi yêu thương nhau như ngày đầu.',
    'Chúc tổ ấm mới ngập tràn niềm vui và tiếng cười.',
    'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường.',
  ],
};
