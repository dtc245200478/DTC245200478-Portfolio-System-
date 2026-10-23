# Kịch bản demo Link Me

Sinh viên Trần Trung Dũng, dtc245200478, CNTT K23D. Giảng viên Vũ Việt Dũng.

1. Mở GitHub, README và lịch sử commit theo ba mốc.
2. Chạy `scripts/start.ps1` trên Windows hoặc `sh scripts/start.sh` trên Ubuntu WSL2.
3. Mở website qua Nginx, xem giới thiệu, dự án, hành trình và liên kết.
4. Mở `/admin`, đăng nhập `admin`; mật khẩu đọc từ `.local/secrets/admin_password`.
5. Sửa lời mời kết nối, lưu và tải lại trang công khai để thấy thay đổi.
6. Tạo dự án bản nháp, thử URL bị 404, công khai và xem trang chi tiết.
7. Upload JPG/PNG/WebP, thử SVG để thấy server từ chối; xóa nội dung demo khi xong.
8. Mở phpMyAdmin, dùng `linkme_admin` và secret tương ứng; xem bảng linkme.
9. Mở Prometheus `/targets`, xác nhận 5 job up; mở Grafana dashboard Link Me.
10. Tạo request và đăng nhập sai, mở Grafana Explore datasource Loki, chạy ba query trong `observability/logql.md`.
11. Giải thích non-root, phân mạng, secret, quyền DB, security headers, CSRF và ngoại lệ quyền cAdvisor/phpMyAdmin.
12. Chạy `scripts/backup.ps1` hoặc `sh scripts/backup.sh`; chỉ restore khi chủ động thay dữ liệu của Link Me.
13. Chạy `scripts/test.ps1` hoặc `sh scripts/test.sh` để xem kết quả smoke test.
14. Kiểm tra daemon bằng `docker --context desktop-linux info` và `docker --host unix:///var/run/docker.sock info` trong WSL.

Các cổng mặc định là website 8088, phpMyAdmin 8089, Grafana 3004, Prometheus 9093. Khi chạy hai engine đồng thời, cấu hình cổng khác cho WSL. Không dùng Docker prune hoặc xóa volume của bài khác.
