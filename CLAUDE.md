# CLAUDE.md

Website thiệp cưới online: giới thiệu gia đình hai bên cô dâu, chú rể, thông tin lễ cưới và nơi tổ chức tiệc. Phong cách **tân cổ điển, chuyên nghiệp**, bám sát mẫu **"Song Phụng Đỏ"** của chungdoi.com (https://chungdoi.com/vi/mau-thiep/song-phung-do/demo). Ảnh tham chiếu: `docs/design/anh1.png` (màn hình mời, desktop 905×749 @2x) và `docs/design/anh2.png` (trang nội dung, desktop).

**Nguồn số đo chuẩn là trang demo thật**, không phải ước lượng từ ảnh: mở bằng Playwright ở 390×844 (mobile) và 905×749 (desktop), đọc class/computed style/rect của phần tử. Mọi số đo trong `css/style.css` đều lấy theo cách này.

## Quy tắc bắt buộc

1. **Sau mỗi thay đổi lớn, chụp screenshot và so sánh với design gốc.** Thay đổi lớn gồm: thêm hoặc sửa một section, đổi layout, đổi màu, font hay design token. Cách làm:
   - Chạy `npm run dev` rồi `npm run shot`. Script chụp màn hình mở thiệp (`cover-*`) và toàn trang (`content-*`) ở 4 viewport: mobile 390, small 320, **design 905×749 @2x** (đúng khung của `anh1.png`/`anh2.png`) và desktop 1440. Ảnh lưu vào `docs/screenshots/`. Script cũng in ra số px cuộn ngang, phải là 0.
   - Cách so tốt nhất: chụp **cả trang demo thật và trang của mình ở cùng viewport/DPR** rồi ghép cạnh nhau. Lưu ý trang demo có **tự động cuộn** sau khi mở thiệp, nên phượng parallax bên đó có thể lệch so với vị trí cuộn 0.
   - Ảnh full-page rất dài: thu nhỏ rồi cắt thành từng đoạn ~1000px bằng `sharp` để xem.
   - Mở ảnh chụp cạnh ảnh gốc `docs/design/anh1.png` (màn hình mời) hoặc `docs/design/anh2.png` (trang nội dung), so sánh bố cục, màu, font, khoảng cách và hoạ tiết.
   - Liệt kê các điểm lệch so với design và sửa trước khi chuyển sang việc khác. Nếu cố ý làm khác design thì ghi lý do.
2. **Website phải mobile-friendly.**
   - Thiết kế mobile-first, kiểm tra ở các độ rộng 320, 375, 390, 414px và desktop.
   - Không có thanh cuộn ngang. Vùng chạm tối thiểu 44×44px. Ô nhập trên thiết bị cảm ứng dùng chữ 16px để iOS không tự zoom; trên desktop (`pointer: fine`) dùng 10px như bản gốc.
   - Dùng `100dvh` thay cho `100vh` cho màn hình mở thiệp. Chừa vùng an toàn bằng `env(safe-area-inset-*)`.
3. **Mọi section phải có animation khi scroll.**
   - Dùng cơ chế chung: thêm class `reveal` (và tuỳ chọn `data-anim="fade|left|right|zoom|band"`) cho phần tử. `IntersectionObserver` trong `js/main.js` sẽ gắn `.is-visible` một lần. Muốn các phần tử con xuất hiện so le thì thêm `data-stagger` cho phần tử cha (delay 90ms mỗi con). Không tự viết animation riêng lẻ cho từng nơi.
   - Hiệu ứng mặc định: fade-up (opacity 0→1, y 26→0, 0.8s, ease-out).
   - Parallax giống bản gốc: `data-parallax="k"` → `translate: 0 (k × scrollY)px` (dùng thuộc tính `translate` để không đè `transform: scaleX(-1)`). Hệ số: phượng hero trái `-.15`, phải `.15`; phượng nét nền `.25`; hoa nền `.35`/`.45`; hoa ở đầu phần gia đình `.2` (tối đa 30px qua `data-parallax-max`).
   - Khi `prefers-reduced-motion` được bật thì chỉ fade, không di chuyển.
   - Khi thêm section mới, kiểm tra lại là đã có animation.

Ngôn ngữ nội dung: **tiếng Việt** (đủ dấu). Trải nghiệm chính là **mobile-first** (khách mở link qua Zalo/Messenger), cột nội dung rộng tối đa **480px** (<768px) và **900px** (≥768px, có viền `#71000122`), nền ngoài cột màu trắng như bản gốc. Breakpoint giống Tailwind: `sm` 640 · `md` 768 · `lg` 1024.

## Tech stack

Site **tĩnh thuần HTML/CSS/JS**, không có bước build (người dùng yêu cầu bắt đầu từ `index.html`).

```
index.html          # toàn bộ markup + SVG sprite icon
css/style.css       # design tokens (:root) + style từng section
js/wedding.js       # NGUỒN NỘI DUNG DUY NHẤT (window.WEDDING)
js/main.js          # bind dữ liệu, lịch, album, sổ lưu bút, hộp quà, RSVP, animation
public/images/album # ảnh cưới WebP
public/images/ornaments # hoạ tiết (tối ưu từ docs/design)
public/audio/music.m4a  # nhạc nền (AAC 96kbps, nén từ docs/audio/nhacnen.mp3)
scripts/screenshot.mjs
docs/design/        # ảnh design gốc (không deploy)
docs/screenshots/   # ảnh chụp để so sánh
```

- Không dùng thư viện JS. Carousel album 3D tự viết trong `main.js`. Chỉ tải Google Fonts.
- Animation: CSS transition kết hợp `IntersectionObserver`, không dùng framework.
- Sổ lưu bút và RSVP hiện **chỉ lưu `localStorage` trên máy khách**. Muốn lưu tập trung (Supabase hoặc Google Sheets) thì hỏi người dùng trước khi làm.
- Dev tool (`devDependencies`): `playwright-core` (chạy bằng Google Chrome có sẵn, `channel: 'chrome'`) và `sharp` (cắt ảnh để so sánh).

Lệnh:
```bash
npm run dev    # python3 -m http.server 5173
npm run shot   # chụp screenshot vào docs/screenshots/ (cần dev server đang chạy)
```

## Nguồn nội dung duy nhất

Toàn bộ dữ liệu thiệp (tên, cha mẹ, địa chỉ, ngày giờ, ngày âm lịch, địa điểm, lịch trình, dress code, ảnh, tài khoản mừng cưới) nằm trong **một file**: `js/wedding.js`. HTML chỉ có chữ mặc định. `main.js` ghi đè nội dung qua thuộc tính `data-bind`, nên khi sửa nội dung thì sửa `wedding.js`. Thêm `?open` vào URL để bỏ qua màn hình mở thiệp. Tên khách mời lấy từ query string, ví dụ `?to=Gia%20đình%20Anh%20Mạnh`, và hiển thị ở màn hình mời và ô tên trong sổ lưu bút.

### Dữ liệu mẫu (đã lấy từ demo chungdoi.com "Song Phụng Đỏ")

Dùng để dựng giao diện. **Thay bằng thông tin thật trước khi gửi thiệp.**

| Mục | Giá trị |
|---|---|
| Cô dâu | **Lê Ngọc Ánh** (tên ngắn: Ngọc Ánh), Út Nữ |
| Chú rể | **Trần Thế Bảo** (tên ngắn: Thế Bảo), Út Nam |
| Thứ tự hiển thị | Cô dâu trước (`brideFirst: true`) |
| Nhà gái | Ông Bà **Lê Văn Khoa** và **Phạm Thị Kim Oanh**, 456 Lê Lợi, Quận 3, TP. Hồ Chí Minh |
| Nhà trai | Ông Bà **Trần Văn Tuấn** và **Lê Thị Hương**, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh |
| Lời báo tin | "TRÂN TRỌNG BÁO TIN" / "LỄ THÀNH HÔN CỦA CON CHÚNG TÔI" (có trong data, nhưng **không hiển thị** vì design không có) |
| Lễ thành hôn | Tại **tư gia**, 09:00 Chủ nhật 03/05/2026 (tức ngày 17 tháng 3 năm Bính Ngọ) |
| Tiệc cưới | Đón khách 17:30, khai tiệc 18:00, Chủ nhật 03/05/2026 |
| Địa điểm tiệc | White Palace Convention Center, 194 Hoàng Văn Thụ, Phú Nhuận, Hồ Chí Minh (toạ độ demo 10.7769, 106.7009. Cần kiểm tra lại, toạ độ này chưa trùng với địa chỉ) |
| Lịch trình | 17:30 Đón khách · 18:30 Khai tiệc · 18:45 Rót rượu, cắt bánh · 19:00 Phục vụ món chính · 21:00 Kết thúc tiệc |
| Dress code | `#651212`, `#8D3A3A`, `#FFB2B2` |
| Lời mời (màn hình mở thiệp) | "Thân mời … đến dự buổi tiệc chung vui cùng gia đình" |
| Lời cảm ơn (footer) | "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!" |
| Mừng cưới | Nhà gái: Vietcombank (BIN 970436). Nhà trai: VietinBank (BIN 970415). QR tạo qua VietQR, chú thích "Quét mã để gửi mừng cưới". **Số tài khoản để `0000000000`, chỉ điền khi người dùng cung cấp số thật. Không dùng số tài khoản trong trang demo.** |
| Nhạc nền | `public/audio/music.m4a` (từ `docs/audio/nhacnen.mp3`, 4:23). Phát khi bấm "Mở thiệp", lặp lại, có nút bật/tắt |
| Placeholder form | "Nhập tên của bạn*" / "Nhập lời chúc của bạn*" |

**Ảnh album** (đã tải về `public/images/album/`, 1600×2400 WebP, tỉ lệ 2:3). Khi crop ảnh, dùng `object-position` theo bảng sau để giữ khuôn mặt:

| File | object-position |
|---|---|
| `01.webp` | `50% 28%` |
| `02.webp` | `50% 20%` |
| `03.webp` | `50% 18%` |
| `04.webp` | `50% 16%` |
| `05.webp` | `50% 20%` |
| `06.webp` | `50% 15%` |

Đây là ảnh mẫu của chungdoi.com, chỉ dùng khi phát triển. Phải thay bằng ảnh cưới thật trước khi public.

## Cấu trúc trang (theo thứ tự của bản gốc)

1. **Màn hình mở thiệp**:
   - Nền overlay gradient `#710001 → #5a0001 → #450001`, có 12 chữ 囍 bay lên với màu, cỡ và tốc độ ngẫu nhiên.
   - Thẻ rộng **310 / 340 (sm) / 520 (md) / 600px (lg)**, cao theo nội dung, bo 8px, nền `rgba(255,240,231,.95)`.
   - Huy hiệu tròn 56px ở `top: 50px`.
   - Hoạ tiết dùng thuộc tính `rotate`/`scale` riêng như bản gốc:
     - Phượng trên trái: rộng 120 (md 220), `top -20, left -20` (md `-20, -50`), `rotate: 10deg`, opacity .9.
     - Phượng dưới phải: rộng 140 (md 220), `bottom -120, right -40` (md `-110, -50`), `scale: -1 1; rotate: 5deg`, opacity .9.
     - Hoa dưới trái: rộng 120 (md 160), `bottom -20, left -20` (md `-30, -30`), **không xoay**, opacity .6.
     - Hoa trên phải: rộng 100 (md 140), `top -15, right -15` (md `-20, -20`), **`rotate: 180deg`**, opacity .6.
   - Chữ: tên dùng Playfair 30px (sm 36px), "&" dùng Baskerville 18px (sm 20px), các dòng còn lại dùng Lora 16–18px. Nút "Mở thiệp" có vệt sáng chạy qua.
2. **Hero**:
   - Tên IN HOA, Playfair 36/44/52px, căn trái.
   - Khung phượng cao 260 (md 488), dải đỏ cao 110 (md 206) đặt ở `top: 50%`.
   - Phượng trái dùng `Phuong 2` (viền kem), kích thước 230×480 (md 431×900), đặt tại `left -90` (md -169).
   - Chữ 囍 155px (md 291).
   - Phượng phải dùng `Phuong` (đỏ đặc), kích thước 155×320 (md 291×600), lật ngang, đặt tại `left: calc(50% + 77.5px)` (md +145.5) và `top -120` (md -225), nằm đè lên dải đỏ.
3. **Thông tin lễ cưới**:
   - Hai cột cha mẹ (subgrid, mỗi cột tối đa 160/280px), vạch giữa cao 60px.
   - Tên cô dâu chú rể EB Garamond **40px (<768) / 64px (≥768)**, tự co nếu tên dài.
   - "CHỦ NHẬT | 03 | THÁNG 05" nằm trên một hàng, hai bên rộng 70/85px.
4. **Album**:
   - Carousel 3D, khung 320×340 (md 550×520).
   - Mỗi ô cách nhau `translateX(60%)`, `translateZ(-150px)`, `rotateY(45deg)`, `scale(.85)`, opacity 1/.75/.5/.3. Chuyển cảnh 1100ms, tự chuyển sau 4 giây.
   - Mũi tên chỉ hiện ở desktop. Vuốt được trên mobile. Bấm vào ảnh giữa để xem lớn.
5. **Thông tin tiệc cưới**:
   - Lịch rộng 296 (md 352), ô ngày cao 30 (md 34), trái tim 26×24 (md 30×28).
   - "Thêm vào lịch" mở Google Calendar. Nút "XÁC NHẬN THAM DỰ" bo 10px.
6. **Địa điểm**: iframe Google Maps cao 260 (md 360), bo 16px, có nút "Chỉ đường".
7. **Dress code**: chấm tròn 40 (md 48). Màu sáng tự có viền `rgba(113,0,1,.19)`.
8. **Lịch trình**: grid `1fr 16px 1fr`, gap 24/32, chấm 10px, đường nối màu 40%.
9. **Sổ lưu bút**: tiêu đề dùng Pattaya. Card lời chúc chữ 12px, khung danh sách cao tối đa 500px.
10. **Hộp quà mừng**: hộp quà vẽ bằng CSS (bản gốc dùng ảnh phong bì riêng, không có trong asset), có lấp lánh vàng `#D4AF37`. Bấm để mở ra QR của hai bên.
11. **Footer**: dải `#710001`, chữ 12/15/18px. Không có dòng "♡ chungdoi.com".

**Hoạ tiết nền toàn trang** (opacity .1):
- 2 phượng nét: đặt ở `right: 50%` và `left: 50%`. Top 800/2000px (md 1150/2050, lg 1200/2100). Cao 850px (md 1594px).
- 2 cành hoa: top 1050/1750px (md 1200/2900, lg 1250/2950). Cao 390/600px (md 731/1125px).
- Thêm một cành hoa đậm ở góc trên phải phần gia đình, rộng 192px (md 360px).

## Design system

### Màu (đúng bản gốc)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--wine` | `#710001` | chữ, tiêu đề, nút, dải đỏ, footer |
| `--wine-80` | `rgba(113,0,1,.8)` | chữ phụ trên thẻ mời |
| `--wine-10` | `rgba(113,0,1,.1)` | nền ô tên khách, nút gợi ý |
| `--cream` | `#FFF0E7` | nền trang và thẻ, chữ trên nền đỏ |
| `--gold` | `#D4AF37` | lấp lánh ở hộp quà |

Nền trang: `#FFF0E7` + `nengiay.jpg` (opacity .3, `100% auto`, lặp dọc).

### Typography (đúng bản gốc)
- Chữ thường: **Baskerville** (font hệ thống trên macOS/iOS), dự phòng "Times New Roman". Weight 300.
- Tiêu đề section: **"Times New Roman"** đậm, IN HOA, `letter-spacing: .05em`, 20px (md 24px).
- Tên trên thẻ mời và hero dùng **Playfair Display**. Tên đầy đủ dùng **EB Garamond**. Chữ trên thẻ mời dùng **Lora**. Tiêu đề "Sổ lưu bút" dùng **Pattaya**.
- Lịch, sổ lưu bút và hộp quà dùng font sans của hệ thống (`ui-sans-serif, system-ui`).
- Luôn kiểm tra font render đúng dấu (ạ, ộ, ữ, ỹ…) trước khi chốt.

## Asset
- Ảnh tham chiếu `docs/design/anh1.png` (1810×1498) và `docs/design/anh2.png` (839×5775) chỉ để tham khảo, **không** đặt vào `public/`. File nhạc gốc ở `docs/audio/`.
- Ảnh cưới: `public/images/album/`, WebP, cạnh dài ≤1600px. 3 ảnh đầu tải ngay (`eager`), các ảnh còn lại lazy load.
- Hoạ tiết là **ảnh gốc của mẫu do người dùng cung cấp** trong `docs/design/`. Bản đã tối ưu nằm ở `public/images/ornaments/`:

  | File web | Nguồn | Dùng ở |
  |---|---|---|
  | `phoenix.webp` | `Phuong.webp` (đỏ đặc) | 2 góc thẻ mời; phượng phải ở hero |
  | `phoenix-outline.webp` | `Phuong 2.webp` (viền kem) | phượng trái ở hero |
  | `phoenix-line.webp` | `Phuong line.webp` | 2 phượng nét nền toàn trang |
  | `hy.webp` | `CHU HY.webp` | chữ 囍 ở hero, hộp quà |
  | `flower.webp` | `HOA.webp` | góc thẻ mời, hoa đầu phần gia đình, 2 hoa nền |
  | `nengiay.jpg` | `NENGIAY.jpg` | nền giấy trang nội dung |

  Khi thay ảnh gốc thì tạo lại bằng `sharp`: WebP chất lượng 80–85, rộng 600–1000px tuỳ kích thước hiển thị lớn nhất ở mật độ 2x.
- Huy hiệu trên thẻ mời là SVG vẽ tay trong `index.html`.

## Quy ước code
- Thứ tự section trong `index.html` theo phần "Cấu trúc trang". Style của từng section nằm dưới comment `/* ---------- N. Tên ---------- */` trong `style.css`: viết cho mobile trước, rồi đến `@media (min-width: 640/768/1024px)`.
- Giữ đúng số đo px của bản gốc ở từng breakpoint. Không dùng `cqw` và không ước lượng từ ảnh.
- Ngày âm lịch ghi tay trong `wedding.js`, không tự tính. Thứ và lịch tháng thì JS tự tính từ `date`.
- Mọi chuỗi do người dùng nhập (tên, lời chúc, `?to=`) phải qua hàm `esc()` trước khi chèn vào HTML.
- Thêm meta Open Graph (ảnh preview, tiêu đề "Thiệp cưới Cô dâu & Chú rể") để link chia sẻ qua Zalo/Facebook hiển thị đẹp.
- Accessibility: có alt cho mọi ảnh và `aria-label` cho mọi nút.

## Kiểm tra trước khi xong việc
- Đã chụp screenshot và so sánh với design gốc (Quy tắc 1).
- Xem ở viewport 320, 390, 905 và 1440px, không có cuộn ngang (Quy tắc 2).
- Mọi section đều có animation khi scroll (Quy tắc 3).
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
- Đọc lại toàn bộ chữ tiếng Việt xem có lỗi dấu hay lỗi font không.
