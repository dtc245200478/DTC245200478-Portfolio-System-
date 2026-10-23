# Truy vấn log Link Me

Grafana → Explore → datasource **Loki**, khoảng thời gian **Last 15 minutes**.

```logql
{project="linkme13", service="nginx", stream="access"} | json
```

Request Nginx, gồm method/path/status/duration; không ghi query string hoặc cookie.

```logql
{project="linkme13", service="app"} | json | event="login_failed"
```

Đăng nhập quản trị thất bại; không ghi tên/mật khẩu hoặc token.

```logql
{project="linkme13", service="app"} | json | level="error"
```

Lỗi ứng dụng; bộ kiểm thử tạo một lỗi có kiểm soát tại API diagnostics có xác thực và CSRF.

Log MySQL: `{project="linkme13", service="mysql"}`. Promtail đọc named volume ở chế độ read-only và lưu positions riêng. Logrotate xoay file khi lớn hơn 5 MB, tối đa 3 bản; chu kỳ kiểm tra 60 giây. Loki giữ log 7 ngày. Docker stdout dùng json-file với max-size 5 MB, max-file 3.

Promtail đã EOL ngày 02/03/2026, được giữ theo yêu cầu đề. Hướng chuyển đổi vận hành dài hạn là Grafana Alloy: https://grafana.com/docs/loki/latest/send-data/promtail/.
