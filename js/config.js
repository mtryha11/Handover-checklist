/* Cấu hình chung cho mọi máy cài ứng dụng.
 * larkUrl: địa chỉ máy chủ đồng bộ Lark (cầu nối). Điền vào đây thì ứng dụng cài ở màn hình chính cũng có sẵn nút
 * "Đăng nhập Lark" mà không cần mở qua đường dẫn có ?lark=… hay nhập tay địa chỉ. VD: 'https://lark-bridge.raitek.vn' */
window.APP_CONFIG = {
  larkUrl: 'https://lark-bridge.raitek.vn',
  // Ghi chú bằng giọng nói (ghi âm rồi chuyển thành chữ). Tạm tắt; đổi thành true để bật lại.
  voice: false
};
