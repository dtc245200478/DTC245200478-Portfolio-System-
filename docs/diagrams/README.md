# Sơ đồ Link Me

Nguồn chuẩn là DOT. Render bằng `word-uml-diagrams/scripts/render_dot.mjs` với bundled Node, `@viz-js/viz` và sharp. PNG 2400 px, metadata 300 DPI; có SVG để chỉnh sửa/chèn vector.

- `application`: từ `compose.yaml`, Nginx và API; browser chỉ truy cập cổng Nginx/phpMyAdmin, không truy cập MySQL trực tiếp.
- `observability`: từ hai Compose bổ sung; Prometheus chủ động scrape app/exporter/cAdvisor, Grafana truy vấn Prometheus/Loki; Promtail đẩy log từ volume.
- `auth`: phạm vi chỉ hai bảng `admins` và `sessions` trong schema.sql; quan hệ 1 đến 0..n, FK NOT NULL và ON DELETE CASCADE. Các bảng nội dung không có FK với bảng media; ảnh được tham chiếu bằng đường dẫn, không vẽ quan hệ FK giả.

Phần báo cáo mô tả đầy đủ 11 bảng bằng bảng dữ liệu và chú thích phạm vi của sơ đồ tài khoản/phiên. Biên mạng và ngoại lệ quyền được giải thích riêng trong chương hardening.
