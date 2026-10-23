# Link Me — Portfolio cá nhân

**Trần Trung Dũng · dtc245200478 · CNTT K23D**  
Giảng viên: **Vũ Việt Dũng**. Bài thực hành **đề 13**, môn Triển khai và Quản trị Hệ thống Phần mềm.

Link Me là website portfolio tiếng Việt có trang quản trị nội dung, MySQL 8.4, phpMyAdmin và Nginx. Ứng dụng dùng Next.js 16, TypeScript, Tailwind CSS và Node.js 24. Kỹ năng, kinh nghiệm và hai dự án Study Board/Data Notes là nội dung minh họa, có ghi nhãn trên website.

## Windows và Docker Desktop

Cần Git và Docker Desktop đang chạy Linux containers, Docker Compose plugin hỗ trợ `up --wait`. Không cần cài Node/MySQL trên máy.

```powershell
git clone https://github.com/dtc245200478/DTC245200478-Portfolio-System-.git link-me
cd link-me
powershell -ExecutionPolicy Bypass -File scripts/start.ps1
```

| Thành phần | Địa chỉ | Tài khoản | Mật khẩu ban đầu |
|---|---|---|---|
| Website | http://localhost:8088 | Công khai | — |
| Admin | http://localhost:8088/admin | admin | `.local/secrets/admin_password` |
| phpMyAdmin | http://localhost:8089 | linkme_admin | `.local/secrets/db_admin_password` |

Xem mật khẩu: `Get-Content .local/secrets/admin_password`. Sau khi đổi trong admin, tệp mật khẩu khởi tạo không tự đổi. Script tạo mật khẩu mạnh một lần; chạy lại giữ dữ liệu và mật khẩu. `.env` cho phép thay cổng nếu bị chiếm.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
powershell -ExecutionPolicy Bypass -File scripts/stop.ps1
```

## Ubuntu WSL2 với Docker Engine riêng

Cần Ubuntu WSL2, Docker Engine, Compose plugin và OpenSSL. Docker Desktop có thể tắt. Không bật Desktop WSL Integration vào distro đang dùng Docker Engine riêng để tránh xung đột socket. Nên clone vào filesystem Linux để build nhanh hơn.

```sh
git clone https://github.com/dtc245200478/DTC245200478-Portfolio-System-.git ~/link-me
cd ~/link-me
sh scripts/start.sh
sh scripts/test.sh
sh scripts/stop.sh
```

Script Bash chọn `unix:///var/run/docker.sock`; script PowerShell chọn context `desktop-linux`. Hai engine giữ image/volume riêng, không tự đồng bộ dữ liệu. Tên Compose `linkme13` tách khỏi bài đề 5/16. Không dùng Docker prune toàn máy.

## Quản lý nội dung

Admin sửa hồ sơ, kỹ năng, học vấn, kinh nghiệm, dự án và liên kết; hỗ trợ sắp xếp, bản nháp/công khai, tải ảnh JPG/PNG/WebP tối đa 5 MB. Server giải mã ảnh rồi xuất WebP với tên UUID. Nội dung lưu MySQL, ảnh lưu named volume. Không cho đăng ký tài khoản công khai. Một portfolio và một quản trị viên.

Schema/migration và seed nằm trong `app/db` và `app/scripts`. Chạy lại migration không nhân đôi seed hoặc đặt lại mật khẩu. Trang công khai đọc dữ liệu động sau khi admin lưu.

## Bảo mật và kiểm tra

App/Nginx/MySQL chạy non-root, giảm capability, filesystem chỉ đọc với vùng ghi riêng; network database/monitoring nội bộ; cổng demo chỉ bind localhost. MySQL có tài khoản app chỉ DML, migration có DDL, DB admin theo database và exporter theo quyền giám sát. Secret không có trong Git/image.

Mật khẩu admin dùng scrypt, phiên lưu hash trong MySQL, cookie HttpOnly/SameSite Strict, CSRF token và kiểm tra Origin, giới hạn đăng nhập. Nginx có security headers, giới hạn upload và timeout. HTTP localhost dùng cookie không Secure; nếu đưa ra Internet phải cấu hình HTTPS, `COOKIE_SECURE=true` và điều chỉnh origin/cổng tương ứng.

`/metrics` không được Nginx công khai. `/health/live` kiểm tra app; `/health/ready` kiểm tra database. Các kiểm thử tự động tạo rồi xóa nội dung thử, đổi mật khẩu rồi phục hồi mật khẩu cũ; một ảnh kiểm thử được giữ trong thư viện để kiểm tra độ bền dữ liệu.

## Xử lý lỗi

- Docker chưa chạy: kiểm tra `docker info`; mở Docker Desktop hoặc khởi động Docker Engine trong Ubuntu.
- Cổng bận: đổi `WEB_PORT`, `DB_TOOL_PORT` và các cổng giám sát trong `.env` trước khi chạy lại.
- Khởi tạo lâu: `docker compose ps -a` và `docker compose logs --tail 80 mysql migrate app`.
- Secret DB phải giữ nguyên sau khi tạo volume; không thay mật khẩu bằng cách sửa file secret đã dùng.
- Dừng hệ thống giữ volume. Việc xóa volume chỉ thực hiện khi chủ động muốn mất dữ liệu của riêng `linkme13`.

## Lịch sử triển khai

1. Website portfolio/admin, MySQL, phpMyAdmin, Nginx và hardening cơ bản.
2. Prometheus, Grafana, cAdvisor và exporter Nginx/MySQL.
3. Loki, Promtail, hardening hoàn chỉnh và báo cáo có minh chứng.

## Giám sát

Mở Grafana tại http://localhost:3004, tài khoản `admin`, mật khẩu trong `.local/secrets/grafana_password`. Dashboard **Link Me | Tổng quan vận hành** tự nạp với 13 panel (10 metrics và 3 log). Prometheus ở http://localhost:9093; `/targets` có 5 job `prometheus`, `linkme`, `nginx`, `mysql`, `cadvisor`. Chờ khoảng 30 giây sau lần chạy đầu để có rate/CPU.

```powershell
Get-Content scripts/check-services.mjs -Raw | docker --context desktop-linux compose exec -T app node --input-type=module
```

```sh
docker compose exec -T app node --input-type=module < scripts/check-services.mjs
```

Script xác nhận target up và CPU/RAM của app, Nginx, MySQL thuộc project `linkme13`; việc chỉ có metrics của Docker host không được coi là đạt. cAdvisor cần quyền privileged và đọc cgroup/socket của host, là ngoại lệ được ghi rõ. Không publish exporter ra host. Alert LinkMeTargetDown kích hoạt khi target giám sát mất trên 1 phút; chưa cấu hình gửi thông báo ra ngoài.

## Log tập trung và LogQL

Grafana → Explore → Loki. Ba truy vấn đã kiểm chứng nằm trong [observability/logql.md](observability/logql.md). Dashboard cũng có 3 panel log. Kiểm tra:

```powershell
Get-Content scripts/verify-logs.mjs -Raw | docker --context desktop-linux compose exec -T app node --input-type=module
```

```sh
docker compose exec -T app node --input-type=module < scripts/verify-logs.mjs
```

Promtail đọc volume log của app/Nginx/MySQL ở chế độ chỉ đọc. Logrotate xoay file trên 5 MB, tối đa 3 bản, kiểm tra mỗi phút. Loki/Prometheus giữ dữ liệu 7 ngày. Promtail đã hết hỗ trợ ngày 02/03/2026, giữ lại theo đề; xem [thông báo Grafana](https://grafana.com/docs/loki/latest/send-data/promtail/).

## Sao lưu và phục hồi

Backup có `database.sql`, `uploads.tar.gz`, `manifest.json` với SHA-256; chứa dữ liệu tài khoản/phiên nên chỉ giữ trong `.local/backups`. Cùng một định dạng dùng được giữa hai engine.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup.ps1
powershell -ExecutionPolicy Bypass -File scripts/restore.ps1 -BackupDir .local/backups/<thu-muc-backup>
```

```sh
sh scripts/backup.sh
sh scripts/restore.sh .local/backups/<thu-muc-backup>
```

Restore kiểm tra project/checksum, yêu cầu nhập `PHUC HOI LINK ME`, dừng app/Nginx, thay database và phục hồi ảnh rồi khởi động lại. `-ConfirmRestore` (PowerShell) hoặc `--confirm` (Bash) dành cho kiểm thử tự động đã chủ động chọn phục hồi. Ảnh cũ không còn tham chiếu được giữ trên volume. Mật khẩu quản trị sau restore theo database trong backup, không theo file mật khẩu khởi tạo trên máy đích.

## Báo cáo và minh chứng

- [Báo cáo Word](docs/Bao_Cao_Link_Me_Tran_Trung_Dung.docx) và [bản PDF](docs/Bao_Cao_Link_Me_Tran_Trung_Dung.pdf).
- [Kịch bản demo](docs/Kich_Ban_Demo.md), [sơ đồ DOT/SVG/PNG](docs/diagrams/README.md), [ảnh và kết quả kiểm thử](docs/evidence).
- App, Nginx, MySQL và các dịch vụ giám sát phù hợp chạy non-root. Ngoại lệ: cAdvisor cần privileged để đọc host; storage-init/log-storage-init cần root để đặt quyền volume; logrotate dùng root với capability giới hạn; phpMyAdmin Apache khởi tạo bằng root, worker phục vụ chạy www-data. Không mô tả tất cả container đều non-root.

Nếu chạy cả hai engine đồng thời, dùng cổng khác nhau trong từng checkout hoặc biến môi trường; kiểm thử tại máy dùng Desktop 8088/8089/3004/9093, WSL 8188/8189/3104/9193. Không bật WSL Integration trong Ubuntu đã cài Docker Engine riêng.
