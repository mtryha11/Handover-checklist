/*
 * Bảo trì bảo dưỡng định kỳ quý (Quarterly Preventive Maintenance).
 *
 * Khác với checklist bàn giao (js/checklist.js – danh sách cố định), checklist bảo trì được NHÂN RA từ:
 *   1. Bộ đầu việc theo LOẠI thiết bị (PM.kinds bên dưới) – do Raitek tự định nghĩa.
 *   2. Hồ sơ thiết bị của từng dự án (site: khu vực + danh mục thiết bị) – lập một lần từ bản vẽ hoàn công.
 * Mỗi thiết bị thành một nhóm riêng (INV1, INV2, DB1...) nên thiếu thiết bị nào là thấy ngay.
 * Các nhóm xếp theo KHU VỰC theo đúng lộ trình đi tại hiện trường.
 *
 * Đầu việc:
 *   n : số thứ tự trong loại thiết bị. KHÔNG đổi hay dùng lại số cũ: kết quả đã lưu gắn với mã <thiết bị>-<n>.
 *   t : nội dung · h : tiêu chí / hướng dẫn · g : nhóm con
 *   f : tần suất – 'Q' mỗi quý (mặc định), 'H' 6 tháng, 'Y' hằng năm
 *   p : 1 = bắt buộc có ảnh · u : đơn vị đo (bắt buộc ghi giá trị) · off : 1 = cần cắt điện
 *   form : dòng tương ứng trên mẫu checklist quý đang ký với chủ đầu tư (A1, B1–B3, C1–C3, D1, E1, F1–F2, G1–G2, H1–H2)
 *   opt : chỉ áp dụng khi thiết bị có tùy chọn này (vd. 'apfc' = tủ có tụ bù)
 *   x : 1 = đã bỏ
 */
(function () {
  'use strict';

  const KINDS = [
    {
      k: 'pre', pre: 'PRE', title: 'Chuẩn bị & an toàn', one: 'Chuẩn bị & an toàn', zone: 'Trước khi lên mái',
      tasks: [
        { n: 1, g: 'Trước khi đến', t: 'Xem cảnh báo, sự cố và sản lượng trên hệ thống giám sát từ đợt trước; lập danh sách inverter / string cần kiểm tra kỹ', h: 'Ghi vào ghi chú: inverter báo lỗi lặp lại, string dòng thấp, thiết bị mất kết nối. Đây là các điểm phải xem đầu tiên khi tới nơi.' },
        { n: 2, g: 'Trước khi đến', t: 'Dụng cụ đo còn hạn hiệu chuẩn: ampe kìm DC, megaohm, máy đo tiếp địa, camera nhiệt, cờ lê lực' },
        { n: 3, g: 'Tại hiện trường', t: 'Đăng ký vào nhà máy, giấy phép làm việc trên cao / làm việc điện; thống nhất khung giờ cắt điện (nếu có)' },
        { n: 4, g: 'Tại hiện trường', t: 'Họp an toàn đầu ca, phân công; kiểm tra PPE: dây đai toàn thân, mũ, giày, găng cách điện', p: 1 },
        { n: 5, g: 'Tại hiện trường', t: 'Thời tiết phù hợp: mái khô, không mưa giông, gió nhẹ', h: 'Ghi bức xạ và nhiệt độ ở tab Thông tin. Chụp nhiệt cần bức xạ từ 600 W/m² trở lên.' }
      ]
    },
    {
      k: 'ladder', pre: 'L', title: 'Thang leo', one: 'Thang leo', zone: 'Mái',
      tasks: [
        { n: 1, t: 'Thang leo: liên kết vào kết cấu chắc chắn, bulong không lỏng, không rỉ sét, lồng bảo vệ nguyên vẹn', form: 'A1', p: 1 },
        { n: 2, t: 'Cửa / khóa chống leo và biển cảnh báo tại chân thang', form: 'A1' }
      ]
    },
    {
      k: 'roof', pre: 'R', title: 'Khu mái & dàn pin', one: 'Khu mái', zone: 'Mái',
      tasks: [
        { n: 1, g: 'Lối đi & an toàn', t: 'Sàn thao tác / lối đi: kẹp đủ, không võng, không rỉ; không có lối đi tắt trên tôn sáng', form: 'A1', p: 1 },
        { n: 2, g: 'Lối đi & an toàn', t: 'Dây cứu sinh, điểm neo, lan can (nếu có): cáp không tưa, tăng đơ và kẹp cáp chắc, còn tem kiểm định', form: 'A1', p: 1 },
        { n: 3, g: 'Tấm pin & khung', t: 'Kiểm tra và siết lại kẹp tấm pin (kẹp giữa, kẹp biên), bulong chân L / kẹp tôn', h: 'Mỗi quý lấy mẫu tối thiểu 10 % và xoay vòng khu vực để một năm phủ hết mái. Ghi dãy đã siết vào ghi chú.', form: 'B1', p: 1 },
        { n: 4, g: 'Tấm pin & khung', t: 'Rail, nối rail, chân đỡ: không cong vênh, không rỉ, không xô lệch', form: 'B1' },
        { n: 5, g: 'Tấm pin & khung', t: 'Bóng che: cây, ống khói, thiết bị mới lắp trên mái, rác, phân chim', form: 'B2', p: 1 },
        { n: 6, g: 'Tấm pin & khung', t: 'Đếm tấm pin hư hỏng: vỡ kính, nứt, cháy điểm, ố vàng, phồng mặt sau, hộp đấu dây; cô lập và đánh dấu trên bản vẽ', h: 'Ghi số tấm hỏng (không có thì ghi 0). Vị trí dãy / string ghi ở ghi chú.', form: 'B3', u: 'tấm', p: 1 },
        { n: 7, g: 'Tấm pin & khung', t: 'Mức độ bám bẩn của tấm pin; đề xuất vệ sinh nếu cần', p: 1 },
        { n: 8, g: 'Tấm pin & khung', t: 'Chụp nhiệt dàn pin: điểm nóng, diode bypass, string hở mạch', h: 'Thực hiện khi bức xạ từ 600 W/m² trở lên và hệ thống đang phát.', f: 'H', p: 1 },
        { n: 9, g: 'Cáp trên mái', t: 'Cáp DC: không võng chạm tôn, không đọng nước, dây rút / kẹp cáp còn tốt, ống luồn không giòn nứt; đầu nối MC4 không chảy, không lai hãng', form: 'E1', p: 1 },
        { n: 10, g: 'Cáp trên mái', t: 'Máng cáp: nắp đủ, không rỉ, có dây liên kết tiếp địa; không có tổ chim, chuột', form: 'E1' },
        { n: 11, g: 'Cáp trên mái', t: 'Tiếp địa khung – rail – tấm pin: lá tiếp địa, kẹp tiếp địa đủ, dây không đứt', f: 'H' },
        { n: 12, g: 'Mái', t: 'Mái không thấm dột tại vị trí bắt vít / kẹp; máng xối không tắc' }
      ]
    },
    {
      k: 'ws', pre: 'WS', title: 'Trạm thời tiết & cảm biến', one: 'Cảm biến', zone: 'Mái',
      tasks: [
        { n: 1, t: 'Vệ sinh cảm biến (bức xạ, nhiệt độ)', form: 'G1', p: 1 },
        { n: 2, t: 'Cảm biến lắp đúng góc, gắn chắc, không hư hỏng; cáp tín hiệu nguyên vẹn', form: 'G2', p: 1 },
        { n: 3, t: 'Số liệu cảm biến hiển thị hợp lý trên hệ thống giám sát' }
      ]
    },
    {
      k: 'inv', pre: 'INV', title: 'Inverter', one: 'Inverter', zone: 'Trạm inverter',
      tasks: [
        { n: 1, g: 'Ngoại quan & vệ sinh', t: 'Nhãn tên, số serial, biển cảnh báo an toàn điện đầy đủ, rõ', form: 'C1', p: 1 },
        { n: 2, g: 'Ngoại quan & vệ sinh', t: 'Vệ sinh vỏ, khe tản nhiệt, quạt / khay quạt; quạt chạy êm, thay nếu hỏng', h: 'Chụp ảnh trước và sau khi vệ sinh.', form: 'C2', p: 1 },
        { n: 3, g: 'Ngoại quan & vệ sinh', t: 'Giá đỡ, bulong treo, mái che chắc chắn; khoảng thoáng tản nhiệt không bị che' },
        { n: 4, g: 'Vận hành', t: 'Đọc nhật ký sự cố trên ứng dụng của hãng; ghi mã lỗi lặp lại', h: 'Chụp màn hình danh sách cảnh báo.', form: 'C3', p: 1 },
        { n: 5, g: 'Vận hành', t: 'Trạng thái vận hành bình thường; ghi sản lượng tích lũy', u: 'kWh' },
        { n: 6, g: 'Vận hành', t: 'So sánh dòng các string trên ứng dụng; ghi string lệch quá 10 % so với các string cùng hướng', h: 'Thực hiện lúc trời nắng ổn định.', p: 1 },
        { n: 7, g: 'Đấu nối', t: 'Đầu nối MC4 tại inverter cắm chặt, không biến màu, không chảy; DC switch thao tác tốt', p: 1 },
        { n: 8, g: 'Đấu nối', t: 'Chụp nhiệt đầu cáp AC / DC khi tải từ 50 % trở lên; ghi nhiệt độ cao nhất', f: 'H', u: '°C', p: 1 },
        { n: 9, g: 'Đấu nối', t: 'Siết lại đầu cáp AC và tiếp địa vỏ theo lực siết của hãng', f: 'Y', off: 1 },
        { n: 10, g: 'Đo kiểm', t: 'Điện trở cách điện các string (giá trị thấp nhất)', h: 'Tối thiểu 1 MΩ theo IEC 62446-1. Có thể đọc giá trị cách điện từ inverter nếu hãng hỗ trợ.', f: 'Y', u: 'MΩ', off: 1 }
      ]
    },
    {
      k: 'db', pre: 'DB', title: 'Tủ điện AC', one: 'Tủ điện', zone: 'Trạm inverter',
      opts: { apfc: 'Có tụ bù (APFC)' },
      tasks: [
        { n: 1, g: 'Vỏ tủ & vệ sinh', t: 'Vỏ tủ không trầy xước, móp; trong tủ thông thoáng, không đọng nước, không côn trùng; gioăng cửa và khóa tốt', form: 'D1', p: 1 },
        { n: 2, g: 'Vỏ tủ & vệ sinh', t: 'Vệ sinh trong tủ, lưới lọc và quạt thông gió', form: 'D1' },
        { n: 3, g: 'Thiết bị', t: 'MCCB / MCB: đúng trạng thái, không biến màu, không mùi khét; nhãn lộ ra và sơ đồ một sợi trong tủ đầy đủ', form: 'D1', p: 1 },
        { n: 4, g: 'Thiết bị', t: 'Chống sét lan truyền (SPD): cửa sổ chỉ thị còn tốt', p: 1 },
        { n: 5, g: 'Thiết bị', t: 'Đồng hồ, đèn báo pha, relay bảo vệ hiển thị bình thường; nút dừng khẩn cấp nguyên vẹn' },
        { n: 6, g: 'Thiết bị', t: 'Tụ bù và contactor: tụ không phồng, không rò dầu; bộ điều khiển hiển thị cosφ', opt: 'apfc', u: 'cosφ' },
        { n: 7, g: 'Đo kiểm', t: 'Chụp nhiệt thanh cái, đầu cáp, MCCB khi mang tải; ghi nhiệt độ cao nhất', h: 'Chênh lệch giữa các pha dưới 10 °C.', f: 'H', u: '°C', p: 1 },
        { n: 8, g: 'Đo kiểm', t: 'Dòng từng cấp tụ bù so với định mức', opt: 'apfc', f: 'H', u: 'A' },
        { n: 9, g: 'Đo kiểm', t: 'Siết lại đầu cáp và thanh cái theo lực siết', f: 'Y', off: 1 },
        { n: 10, g: 'Đo kiểm', t: 'Thử nút dừng khẩn cấp / cuộn cắt', f: 'Y', off: 1 }
      ]
    },
    {
      k: 'mon', pre: 'MON', title: 'Giám sát & truyền thông', one: 'Tủ giám sát', zone: 'Trạm inverter',
      opts: { zx: 'Có chống phát ngược (zero export)' },
      tasks: [
        { n: 1, t: 'Vệ sinh tủ giám sát; tủ thông thoáng, không đọng nước, không côn trùng', form: 'F1', p: 1 },
        { n: 2, t: 'Thiết bị giám sát hoạt động bình thường: logger, router / 4G, nguồn; dữ liệu trên cổng giám sát đủ các inverter', form: 'F2', p: 1 },
        { n: 3, t: 'SIM / Internet còn hạn và còn dung lượng' },
        { n: 4, t: 'Đồng hồ đo chống phát ngược đọc được, số liệu khớp đồng hồ tủ; chức năng giới hạn công suất hoạt động', opt: 'zx', p: 1 }
      ]
    },
    {
      k: 'gnd', pre: 'GND', title: 'Tiếp địa', one: 'Hộp tiếp địa', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Hộp kiểm tra tiếp địa, thanh cái tiếp địa, mối nối: không rỉ, không lỏng', p: 1 },
        { n: 2, t: 'Đo điện trở tiếp địa', h: 'Không vượt 4 Ω hoặc theo thiết kế.', f: 'Y', u: 'Ω', p: 1 }
      ]
    },
    {
      k: 'pump', pre: 'PMP', title: 'Hệ thống nước vệ sinh', one: 'Trạm bơm', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Bơm, bồn, đường ống, van và vòi trên mái không rò rỉ; chạy thử bơm' },
        { n: 2, t: 'Tủ điện bơm và MCB cấp nguồn', f: 'H' }
      ]
    },
    {
      k: 'ff', pre: 'FF', title: 'Phòng cháy chữa cháy', one: 'PCCC', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Bình chữa cháy đủ số lượng, có kẹp chì, vòi, chốt, tay cầm; còn hạn, kim áp suất ở vùng xanh', form: 'H1', p: 1 },
        { n: 2, t: 'Vệ sinh đầu báo cháy / báo khói (nếu có)', form: 'H2' },
        { n: 3, t: 'Biển cảnh báo, nội quy, hướng dẫn ngắt khẩn cấp đầy đủ, đọc được' }
      ]
    },
    {
      k: 'cable', pre: 'CA', title: 'Tuyến cáp AC', one: 'Tuyến cáp', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Kiểm tra nguy cơ và cáp hỏng dọc tuyến: vỏ cáp, vị trí xuyên tường / mái đã bịt kín, máng cáp có nắp', form: 'E1', p: 1 },
        { n: 2, t: 'Nhãn cáp hai đầu đầy đủ, đọc được', f: 'H' }
      ]
    },
    {
      k: 'msb', pre: 'MSB', title: 'Điểm đấu nối', one: 'Điểm đấu nối', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Lộ điện mặt trời tại tủ MSB: thiết bị đóng cắt đúng trạng thái, có nhãn nguồn điện mặt trời, đầu cáp không biến màu', p: 1 },
        { n: 2, t: 'Biến dòng đo chống phát ngược: đấu nối chắc, đúng chiều', f: 'H' },
        { n: 3, t: 'Chụp nhiệt đầu cáp lộ điện mặt trời; ghi nhiệt độ cao nhất', f: 'H', u: '°C', p: 1 }
      ]
    },
    {
      k: 'tba', pre: 'TBA', title: 'Trạm biến áp', one: 'Trạm biến áp', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Máy biến áp: không rò dầu, mức dầu, không có tiếng ồn bất thường; ghi nhiệt độ', u: '°C', p: 1 },
        { n: 2, t: 'Trạm sạch, có khóa, biển báo, thông gió tốt' }
      ]
    },
    {
      k: 'end', pre: 'END', title: 'Kết thúc & trả hiện trường', one: 'Kết thúc', zone: 'Kết thúc',
      tasks: [
        { n: 1, t: 'Chốt chỉ số công tơ / tổng sản lượng tích lũy', u: 'kWh', p: 1 },
        { n: 2, t: 'Thu dọn dụng cụ, rác, vật tư trên mái; đếm đủ dụng cụ', p: 1 },
        { n: 3, t: 'Khóa tủ, khóa cửa thang; toàn bộ inverter hòa lưới lại bình thường', p: 1 },
        { n: 4, t: 'Thông báo sơ bộ các tồn tại cho đại diện nhà máy / chủ đầu tư' }
      ]
    }
  ];

  // Mẫu checklist quý đang ký với chủ đầu tư (BBNT kèm checklist O&M).
  const FORM = [
    { k: 'A', t: 'Thang leo, lối đi bộ và dây cứu sinh', lines: [{ k: 'A1', t: 'Kiểm tra thang leo, lối đi và dây cứu sinh: không hư hỏng, không có điểm yếu', m: 'Trực quan và dụng cụ' }] },
    { k: 'B', t: 'Tấm pin NLMT và khung giá đỡ', lines: [
      { k: 'B1', t: 'Kiểm tra và siết lại các vị trí kẹp tấm pin', m: 'Trực quan và thiết bị' },
      { k: 'B2', t: 'Kiểm tra các vị trí có nguy cơ bị bóng che', m: 'Trực quan' },
      { k: 'B3', t: 'Kiểm tra số lượng tấm pin vỡ; cô lập và đánh dấu trên bản vẽ hoàn công', m: 'Trực quan và thiết bị' }] },
    { k: 'C', t: 'Bộ biến tần (inverter)', lines: [
      { k: 'C1', t: 'Inverter có đầy đủ nhãn tên, số serial và cảnh báo an toàn điện', m: 'Trực quan' },
      { k: 'C2', t: 'Vệ sinh vỏ, quạt của inverter và thay thế khi cần', m: 'Thiết bị' },
      { k: 'C3', t: 'Kiểm tra báo cáo sự cố của các inverter bằng ứng dụng', m: 'Ứng dụng' }] },
    { k: 'D', t: 'Tủ điện', lines: [{ k: 'D1', t: 'Vỏ tủ không trầy xước, móp; trong tủ thông thoáng, không đọng nước, côn trùng', m: 'Trực quan' }] },
    { k: 'E', t: 'Cáp điện', lines: [{ k: 'E1', t: 'Kiểm tra nguy cơ hoặc cáp hỏng', m: 'Trực quan' }] },
    { k: 'F', t: 'Thiết bị giám sát', lines: [
      { k: 'F1', t: 'Vệ sinh tủ giám sát; tủ thông thoáng, không đọng nước, côn trùng', m: 'Trực quan' },
      { k: 'F2', t: 'Trạng thái hoạt động của thiết bị giám sát bình thường', m: 'Trực quan' }] },
    { k: 'G', t: 'Trạm thời tiết', lines: [
      { k: 'G1', t: 'Vệ sinh cảm biến thời tiết', m: 'Thiết bị' },
      { k: 'G2', t: 'Cảm biến bức xạ lắp đúng góc, không hư hỏng', m: 'Trực quan' }] },
    { k: 'H', t: 'Hệ thống PCCC', lines: [
      { k: 'H1', t: 'Bình chữa cháy đầy đủ, có kẹp chì, vòi, chốt, tay cầm; còn hạn', m: 'Trực quan' },
      { k: 'H2', t: 'Vệ sinh đầu báo cháy', m: 'Thiết bị' }] }
  ];

  const RANK = { Q: 0, H: 1, Y: 2 };
  const SCOPES = { q: 'Hạng mục quý', h: 'Quý + hạng mục 6 tháng', y: 'Quý + 6 tháng + hằng năm' };
  const FREQ = { H: '6 tháng', Y: 'Hằng năm' };
  const kindOf = (k) => KINDS.find((x) => x.k === k);

  // Phạm vi mặc định theo quý: Quý 2 thêm hạng mục 6 tháng, Quý 4 thêm cả hạng mục năm.
  const defaultScope = (period) => ({ Q2: 'h', Q4: 'y' }[period] || 'q');

  function nextId(site, kind) {
    const K = kindOf(kind); const one = ['pre', 'end'].includes(kind);
    if (one && !site.assets.some((a) => a.id === K.pre)) return K.pre;
    for (let i = 1; ; i++) { const id = K.pre + i; if (!site.assets.some((a) => a.id === id)) return id; }
  }

  // Tạo nhanh hồ sơ thiết bị theo số lượng từng loại.
  const QUICK = [['roof', 'Số khu mái'], ['ladder', 'Số thang leo'], ['inv', 'Số inverter'], ['db', 'Số tủ điện AC'], ['mon', 'Số tủ giám sát'],
    ['ws', 'Số trạm thời tiết / cảm biến'], ['gnd', 'Số hộp tiếp địa'], ['msb', 'Số điểm đấu nối (MSB)'], ['cable', 'Số tuyến cáp AC'],
    ['tba', 'Số trạm biến áp trong phạm vi'], ['pump', 'Số trạm bơm nước vệ sinh'], ['ff', 'Số khu vực PCCC']];
  function quick(counts) {
    const c = Object.assign({ roof: 1, ladder: 1, inv: 1, db: 1, mon: 1, ws: 0, gnd: 1, msb: 1, cable: 0, tba: 0, pump: 0, ff: 1 }, counts || {});
    const site = { zones: [], assets: [], notes: [] };
    const add = (kind, n) => {
      const K = kindOf(kind);
      for (let i = 0; i < n; i++) {
        const id = nextId(site, kind);
        site.assets.push({ k: kind, id, n: n > 1 ? `${K.one} ${String(i + 1).padStart(2, '0')}` : K.one, z: K.zone, d: '' });
      }
    };
    add('pre', 1);
    KINDS.filter((K) => K.k !== 'pre' && K.k !== 'end').forEach((K) => add(K.k, Math.max(0, Math.min(200, parseInt(c[K.k], 10) || 0))));
    add('end', 1);
    return normalize(site);
  }

  // Chuẩn hóa hồ sơ: bỏ thiết bị sai loại / trùng mã, bổ sung khu vực còn thiếu.
  function normalize(site) {
    site = site || {};
    const seen = new Set();
    site.assets = (site.assets || []).filter((a) => a && kindOf(a.k) && a.id && !seen.has(a.id) && seen.add(a.id))
      .map((a) => ({ k: a.k, id: String(a.id), n: String(a.n || kindOf(a.k).one), z: String(a.z || kindOf(a.k).zone), d: String(a.d || ''), opt: Array.isArray(a.opt) ? a.opt : [] }));
    const zones = (site.zones || []).map(String).filter((z, i, arr) => z && arr.indexOf(z) === i);
    site.assets.forEach((a) => { if (!zones.includes(a.z)) zones.push(a.z); });
    site.zones = zones.filter((z) => site.assets.some((a) => a.z === z));
    site.notes = (site.notes || []).map(String).filter(Boolean);
    site.rev = Date.now() + Math.random();
    return site;
  }

  // Nhân checklist: mỗi thiết bị thành một nhóm, xếp theo khu vực (lộ trình).
  function build(site, scope) {
    const lim = RANK[(scope || 'q').toUpperCase()] || 0;
    const out = [];
    (site.zones || []).forEach((z, zi) => {
      site.assets.filter((a) => a.z === z).forEach((a) => {
        const K = kindOf(a.k);
        const items = K.tasks.filter((t) => RANK[t.f || 'Q'] <= lim && (!t.opt || (a.opt || []).includes(t.opt)))
          .map((t) => ({ c: `${a.id}-${String(t.n).padStart(2, '0')}`, t: t.t, h: t.h, u: t.u, g: t.g, x: t.x, f: t.f || 'Q', p: t.p, off: t.off, form: t.form || '' }));
        out.push({ id: a.id, title: a.n, sub: a.d, kind: a.k, part: String(zi + 1), partTitle: z, items });
      });
    });
    return out;
  }

  const countTasks = () => KINDS.reduce((n, K) => n + K.tasks.filter((t) => !t.x).length, 0);

  window.PM = { version: '2026.11-PM1', kinds: KINDS, form: FORM, scopes: SCOPES, freq: FREQ, quickFields: QUICK, kindOf, defaultScope, nextId, quick, normalize, build, countTasks };
})();
