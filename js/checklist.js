/*
 * Bộ checklist kiểm tra hiện trạng & nhận bàn giao O&M dự án điện mặt trời.
 *
 * Cách sửa / bổ sung hạng mục:
 *   c : mã hạng mục (duy nhất)
 *   t : nội dung kiểm tra
 *   h : tiêu chí / hướng dẫn (hiện khi bấm nút "i")
 *   u : đơn vị nếu hạng mục cần ghi giá trị đo (V, A, MΩ, Ω, °C, %, kWh...)
 *   s : loại dự án áp dụng, cách nhau bởi dấu cách: "roof" (áp mái), "ground" (mặt đất),
 *       "float" (nổi). Bỏ trống = áp dụng cho mọi loại.
 *
 * Khi đổi nội dung, tăng VERSION trong sw.js để điện thoại tải bản mới.
 */
window.CHECKLIST = {
  version: '2026.11',
  types: {
    roof: 'Áp mái (Rooftop)',
    ground: 'Mặt đất (Ground-mounted)',
    float: 'Nổi trên mặt nước (Floating)'
  },
  sections: [
    {
      id: 'HS', title: 'Hồ sơ pháp lý & tài liệu bàn giao',
      items: [
        { c: 'HS-01', t: 'Giấy chứng nhận đầu tư / chủ trương đầu tư, giấy phép xây dựng (nếu thuộc diện cấp phép)', h: 'Bản sao có xác nhận; đối chiếu tên chủ đầu tư, địa điểm, công suất.' },
        { c: 'HS-02', t: 'Thỏa thuận đấu nối và Hợp đồng mua bán điện (PPA) với EVN / bên mua điện', h: 'Ghi lại điểm đấu nối, giới hạn công suất phát, cơ chế giá, thời hạn hợp đồng.' },
        { c: 'HS-03', t: 'Biên bản nghiệm thu hoàn thành đưa vào sử dụng, xác nhận ngày vận hành thương mại (COD)', h: 'Ngày COD là mốc tính bảo hành và cam kết hiệu suất.' },
        { c: 'HS-04', t: 'Giấy phép hoạt động điện lực (nếu thuộc diện phải cấp)', h: 'Kiểm tra thời hạn hiệu lực và phạm vi hoạt động.' },
        { c: 'HS-05', t: 'Bản vẽ hoàn công: sơ đồ một sợi (SLD), mặt bằng bố trí tấm pin, sơ đồ đấu string', h: 'Bản cứng + file CAD/PDF. Sơ đồ string phải khớp nhãn thực tế ngoài hiện trường.' },
        { c: 'HS-06', t: 'Bản vẽ hoàn công tuyến cáp DC/AC, hệ thống tiếp địa và chống sét', h: 'Có vị trí cọc tiếp địa, hố kiểm tra, tuyến cáp ngầm.' },
        { c: 'HS-07', t: 'Hồ sơ thiết kế kết cấu khung giá đỡ, móng; báo cáo thẩm tra khả năng chịu lực mái', h: 'Áp mái: bắt buộc có đánh giá kết cấu mái/kèo chịu tải tấm pin, gió bão.' },
        { c: 'HS-08', t: 'Datasheet, chứng nhận CO/CQ của tấm pin, inverter, MBA, tủ điện, cáp', h: 'Đối chiếu model, số lượng với hóa đơn và thực tế lắp đặt.' },
        { c: 'HS-09', t: 'Danh sách serial tấm pin (kèm flash test) và serial inverter', h: 'File Excel; cần cho yêu cầu bảo hành sau này.' },
        { c: 'HS-10', t: 'Biên bản chạy thử (commissioning) theo IEC 62446-1: Voc, Isc, cực tính, cách điện từng string', h: 'Dùng làm số liệu gốc (baseline) để so sánh khi vận hành.' },
        { c: 'HS-11', t: 'Báo cáo đo đường cong I-V và chụp ảnh nhiệt (IR) tại thời điểm nghiệm thu', h: 'Nếu chưa có, đề nghị EPC thực hiện trước khi bàn giao.' },
        { c: 'HS-12', t: 'Biên bản thí nghiệm MBA, tủ trung thế/RMU, rơ le bảo vệ, cáp trung thế', h: 'Do đơn vị thí nghiệm có chức năng thực hiện; kiểm tra ngày thí nghiệm.' },
        { c: 'HS-13', t: 'Phiếu chỉnh định rơ le và bảng thông số cài đặt inverter (grid code) đã được phê duyệt', h: 'Bản có chữ ký của điện lực / đơn vị điều độ (nếu áp dụng).' },
        { c: 'HS-14', t: 'Biên bản kiểm định công tơ, TU/TI và biên bản niêm phong hệ thống đo đếm', h: 'Ghi nhận số tem kiểm định, số chì niêm phong.' },
        { c: 'HS-15', t: 'Biên bản đo điện trở tiếp địa và kiểm tra hệ thống chống sét', h: 'So sánh với giá trị thiết kế.' },
        { c: 'HS-16', t: 'Hồ sơ PCCC: thẩm duyệt / nghiệm thu PCCC, phương án chữa cháy cơ sở', h: 'Áp mái: kiểm tra văn bản chấp thuận của cơ quan PCCC (nếu thuộc diện).' },
        { c: 'HS-17', t: 'Tài liệu hướng dẫn vận hành & bảo trì (O&M manual) của nhà sản xuất thiết bị', h: 'Tấm pin, inverter, MBA, tủ RMU, logger, trạm thời tiết...' },
        { c: 'HS-18', t: 'Quy trình vận hành, quy trình thao tác đóng cắt, quy trình xử lý sự cố, phiếu công tác / LOTO', h: 'Phù hợp cấu hình thực tế của nhà máy.' },
        { c: 'HS-19', t: 'Chứng nhận bảo hành: tấm pin (sản phẩm + hiệu suất), inverter, MBA, kết cấu, chống thấm mái', h: 'Ghi lại ngày bắt đầu, thời hạn, điều kiện mất bảo hành.' },
        { c: 'HS-20', t: 'Đầu mối liên hệ bảo hành của EPC và nhà cung cấp, thời gian phản hồi cam kết', h: 'Tên, số điện thoại, email, quy trình gửi yêu cầu bảo hành.' },
        { c: 'HS-21', t: 'Hợp đồng bảo hiểm tài sản / trách nhiệm (nếu có)', h: 'Phạm vi, thời hạn, đầu mối bồi thường.' },
        { c: 'HS-22', t: 'Bàn giao tài khoản quản trị: monitoring/SCADA, inverter, logger, router, camera', h: 'Quyền admin; đổi mật khẩu sau khi nhận.' },
        { c: 'HS-23', t: 'Danh mục vật tư, phụ tùng dự phòng và dụng cụ bàn giao', h: 'Kèm số lượng, tình trạng, vị trí cất giữ.' },
        { c: 'HS-24', t: 'Hồ sơ môi trường (ĐTM / kế hoạch bảo vệ môi trường) và các cam kết liên quan', s: 'ground float' },
        { c: 'HS-25', t: 'Nhật ký vận hành, sổ sự cố từ COD đến nay; danh sách tồn tại (punch list) của EPC', h: 'Xác định tồn tại EPC còn phải xử lý trước/sau bàn giao.' },
        { c: 'HS-26', t: 'Hợp đồng thuê mái/đất, quy định ra vào khu vực, đầu mối phía chủ nhà xưởng / chủ đất', h: 'Thời gian được phép làm việc, thủ tục đăng ký ra vào, quy định an toàn của nhà máy.' }
      ]
    },
    {
      id: 'PV', title: 'Tấm pin quang điện (PV modules)',
      items: [
        { c: 'PV-01', t: 'Không có tấm pin vỡ kính, nứt, cong vênh, trầy xước sâu', h: 'Chụp ảnh từng tấm lỗi, ghi vị trí (dãy / string / số thứ tự).' },
        { c: 'PV-02', t: 'Không cháy, đổi màu, phồng rộp backsheet, tách lớp (delamination)', h: 'Kiểm tra cả mặt sau tấm pin tại các vị trí đại diện.' },
        { c: 'PV-03', t: 'Không có vết snail trail, ố vàng EVA, ăn mòn ribbon / busbar' },
        { c: 'PV-04', t: 'Khung nhôm nguyên vẹn, không móp méo, không ăn mòn' },
        { c: 'PV-05', t: 'Hộp nối (junction box) kín, không nứt, không cháy; cáp ra không bị kéo căng' },
        { c: 'PV-06', t: 'Đúng chủng loại, công suất, số lượng theo thiết kế; nhãn và serial còn đọc được', h: 'Ghi số lượng thực tế nếu khác hồ sơ.' },
        { c: 'PV-07', t: 'Bề mặt sạch; không bị bóng che bất thường (cây, ăng-ten, ống khói, vật thể)', h: 'Đánh giá mức độ bẩn để lên kế hoạch vệ sinh đầu tiên.' },
        { c: 'PV-08', t: 'Ảnh nhiệt (IR): không có hotspot, cell / diode bypass nóng bất thường', u: '°C', h: 'Ghi ΔT lớn nhất. Chụp IR khi bức xạ ≥ 600 W/m². ΔT > 20 °C cần xử lý (tham khảo IEC TS 62446-3).' },
        { c: 'PV-09', t: 'Khe hở giữa các tấm và giữa các hàng đúng thiết kế, đảm bảo giãn nở và thoát nước' },
        { c: 'PV-10', t: 'Kẹp tấm pin (clamp) đúng vùng kẹp theo hướng dẫn NSX, đủ lực siết, không đè lên kính', h: 'Kẹp sai vùng có thể làm mất bảo hành tấm pin.' }
      ]
    },
    {
      id: 'KC', title: 'Khung giá đỡ & kết cấu',
      items: [
        { c: 'KC-01', t: 'Khung, ray, thanh giằng không biến dạng; đúng góc nghiêng và hướng thiết kế' },
        { c: 'KC-02', t: 'Lớp mạ kẽm / anod nguyên vẹn, không gỉ sét; vết cắt, lỗ khoan đã được sơn xử lý' },
        { c: 'KC-03', t: 'Bu lông đủ số lượng, đúng vật liệu (inox / mạ kẽm), siết đủ lực, có đánh dấu torque mark', h: 'Kiểm tra xác suất bằng cờ lê lực tại các vị trí đại diện.' },
        { c: 'KC-04', t: 'Không có tiếp xúc trực tiếp giữa kim loại khác loại gây ăn mòn điện hóa (có đệm cách ly)' },
        { c: 'KC-05', t: 'Chân đế / kẹp tôn lắp đúng sóng tôn, có gioăng; không thấm dột tại vị trí bắt vít', s: 'roof', h: 'Kiểm tra từ phía dưới mái nếu có thể, đặc biệt sau mưa.' },
        { c: 'KC-06', t: 'Mái tôn không võng, không gỉ; máng xối thông thoáng, không đọng nước dưới dãy pin', s: 'roof' },
        { c: 'KC-07', t: 'Lối đi bảo trì (walkway) đủ và chắc chắn, không đi trực tiếp trên tôn hoặc tấm pin', s: 'roof' },
        { c: 'KC-08', t: 'Móng cọc / móng bê tông không nứt, lún, xói lở; cao độ đúng thiết kế', s: 'ground' },
        { c: 'KC-09', t: 'Khoảng cách từ mép dưới tấm pin đến mặt đất đủ, không bị ngập hoặc cỏ che', s: 'ground' },
        { c: 'KC-10', t: 'Phao nổi không nứt, thủng, biến dạng; liên kết giữa các phao chắc chắn', s: 'float' },
        { c: 'KC-11', t: 'Hệ neo, dây neo, điểm neo bờ đúng thiết kế, không mòn hoặc chùng bất thường', s: 'float', h: 'Kiểm tra theo mực nước thấp nhất và cao nhất.' },
        { c: 'KC-12', t: 'Lối đi trên phao, lan can, thiết bị cứu sinh (áo phao, phao tròn) đầy đủ', s: 'float' }
      ]
    },
    {
      id: 'DC', title: 'Cáp DC & đấu nối string',
      items: [
        { c: 'DC-01', t: 'Cáp DC đúng chủng loại cáp solar (H1Z2Z2-K / PV1-F), đúng tiết diện thiết kế' },
        { c: 'DC-02', t: 'Cáp được cố định bằng dây rút chống UV hoặc kẹp inox; không treo lơ lửng, không cọ mép sắc' },
        { c: 'DC-03', t: 'Cáp không nằm trực tiếp trên mái / mặt đất / mặt nước; bán kính uốn đúng quy định' },
        { c: 'DC-04', t: 'Connector MC4 hai đầu cùng hãng, cùng chủng loại (không lai hãng); bấm đúng dụng cụ, khóa chặt', h: 'Connector lai hãng là nguyên nhân cháy phổ biến và làm mất bảo hành.' },
        { c: 'DC-05', t: 'Connector không nằm ở vị trí đọng nước; không có dấu hiệu cháy, nóng chảy, biến màu' },
        { c: 'DC-06', t: 'Máng / ống luồn cáp có nắp, chống UV, đầu ống bịt kín; máng kim loại được tiếp địa' },
        { c: 'DC-07', t: 'Nhãn string (+ / −) ở hai đầu cáp, khớp với sơ đồ hoàn công' },
        { c: 'DC-08', t: 'Cáp + và − của cùng string đi song song, hạn chế vòng cảm ứng sét' },
        { c: 'DC-09', t: 'Đo Voc từng string; sai lệch giữa các string cùng cấu hình ≤ 5 %', u: 'V', h: 'Ghi giá trị nhỏ nhất – lớn nhất hoặc đính kèm bảng đo. Ghi bức xạ và nhiệt độ lúc đo.' },
        { c: 'DC-10', t: 'Đo Isc / dòng làm việc từng string; không có string bất thường so với bức xạ', u: 'A' },
        { c: 'DC-11', t: 'Kiểm tra cực tính đúng trên toàn bộ string' },
        { c: 'DC-12', t: 'Đo điện trở cách điện string (+/PE, −/PE)', u: 'MΩ', h: 'IEC 62446-1: điện áp thử 1000 V DC, tối thiểu 1 MΩ. Ghi giá trị thấp nhất.' },
        { c: 'DC-13', t: 'Cáp chôn ngầm có băng báo cáp, mốc báo hiệu, độ sâu đúng thiết kế', s: 'ground' }
      ]
    },
    {
      id: 'CB', title: 'Tủ DC / Combiner box',
      items: [
        { c: 'CB-01', t: 'Vỏ tủ nguyên vẹn, cấp bảo vệ phù hợp (ngoài trời ≥ IP65), có khóa', h: 'Đánh dấu N/A cả mục nếu dùng string inverter không có tủ DC.' },
        { c: 'CB-02', t: 'Ốc siết cáp (cable gland) kín; lỗ chờ không dùng đã được bịt' },
        { c: 'CB-03', t: 'Cầu chì string đúng định mức DC, đủ cả hai cực (nếu thiết kế yêu cầu)' },
        { c: 'CB-04', t: 'Chống sét DC (SPD) đúng loại, cửa sổ chỉ thị còn tốt' },
        { c: 'CB-05', t: 'Cầu dao / công tắc cách ly DC đúng định mức DC, thao tác tốt' },
        { c: 'CB-06', t: 'Đầu cốt, đầu dây siết chặt; ảnh nhiệt không có điểm phát nhiệt', u: '°C' },
        { c: 'CB-07', t: 'Nhãn nhận diện tủ và nhãn cảnh báo "Điện DC – vẫn còn điện khi đã cắt"' }
      ]
    },
    {
      id: 'INV', title: 'Inverter',
      items: [
        { c: 'INV-01', t: 'Đúng chủng loại, số lượng; serial khớp với hồ sơ' },
        { c: 'INV-02', t: 'Lắp đặt chắc chắn, khoảng cách thông gió đúng hướng dẫn NSX; có mái che nắng mưa', h: 'Inverter bị nắng chiếu trực tiếp dễ giảm công suất do quá nhiệt (derating).' },
        { c: 'INV-03', t: 'Quạt tản nhiệt, lưới lọc sạch, hoạt động bình thường; không có tiếng ồn lạ' },
        { c: 'INV-04', t: 'Tiếp địa vỏ inverter đúng, tiết diện dây đủ' },
        { c: 'INV-05', t: 'Đấu nối DC / AC chắc chắn, gland kín; không có dấu hiệu phát nhiệt' },
        { c: 'INV-06', t: 'Công tắc DC tích hợp (DC switch) thao tác tốt' },
        { c: 'INV-07', t: 'Inverter đang vận hành bình thường, không có lỗi hoặc cảnh báo đang tồn tại' },
        { c: 'INV-08', t: 'Đã xem lịch sử lỗi (event log) từ COD; ghi nhận các lỗi lặp lại', h: 'Ghi mã lỗi lặp lại vào ghi chú.' },
        { c: 'INV-09', t: 'Phiên bản firmware đã ghi nhận và là bản được NSX khuyến nghị' },
        { c: 'INV-10', t: 'Thông số cài đặt (grid code, giới hạn công suất, Cosφ, chống phát ngược) đúng bản phê duyệt' },
        { c: 'INV-11', t: 'Công suất phát giữa các inverter / MPPT cùng cấu hình chênh lệch nhỏ', u: '%', h: 'Ghi mức chênh lệch lớn nhất. Thông thường ≤ 3 – 5 %.' },
        { c: 'INV-12', t: 'Giá trị điện trở cách điện (Riso) hiển thị trên inverter trong giới hạn', u: 'kΩ' },
        { c: 'INV-13', t: 'Nhãn nhận diện inverter, sơ đồ đấu nối được dán tại chỗ' }
      ]
    },
    {
      id: 'AC', title: 'Tủ điện AC hạ thế / tủ hòa lưới',
      items: [
        { c: 'AC-01', t: 'Vỏ tủ, cửa, khóa, cấp IP phù hợp; bên trong sạch, không côn trùng, có lưới chắn chuột' },
        { c: 'AC-02', t: 'MCCB / ACB đúng định mức theo SLD; cài đặt bảo vệ (Ir, Isd, Ii) đúng phiếu chỉnh định' },
        { c: 'AC-03', t: 'Thanh cái, đầu cốt siết đủ lực, có đánh dấu; ảnh nhiệt không có điểm nóng', u: '°C', h: 'Ghi ΔT lớn nhất giữa các pha. ΔT > 10 °C cần kiểm tra lại.' },
        { c: 'AC-04', t: 'Chống sét AC (SPD) chỉ thị tốt; có MCB / cầu chì bảo vệ SPD' },
        { c: 'AC-05', t: 'Đồng hồ đa năng hiển thị đúng; TI đúng tỉ số' },
        { c: 'AC-06', t: 'Liên động cơ / điện giữa các máy cắt hoạt động đúng (nếu có)' },
        { c: 'AC-07', t: 'Cáp AC đúng tiết diện, có nhãn pha, đầu cáp được bọc co nhiệt' },
        { c: 'AC-08', t: 'Sơ đồ một sợi dán trong tủ; nhãn thiết bị và biển cảnh báo điện áp đầy đủ' },
        { c: 'AC-09', t: 'Thử đóng / cắt máy cắt, cuộn cắt (shunt trip) và nút dừng khẩn cấp hoạt động đúng' }
      ]
    },
    {
      id: 'TBA', title: 'Trạm biến áp & thiết bị trung thế',
      items: [
        { c: 'TBA-01', t: 'MBA: mức dầu đúng, không rò rỉ dầu tại van, gioăng, sứ', h: 'Đánh dấu N/A cả mục nếu dự án đấu nối hạ thế, không có trạm riêng.' },
        { c: 'TBA-02', t: 'Hạt hút ẩm (silicagel) bình thở chưa đổi màu quá 2/3' },
        { c: 'TBA-03', t: 'Đồng hồ nhiệt độ dầu / cuộn dây, rơ le hơi, van an toàn hoạt động và có tín hiệu về tủ điều khiển' },
        { c: 'TBA-04', t: 'Sứ cách điện sạch, không nứt vỡ; đầu cực không phát nhiệt', u: '°C' },
        { c: 'TBA-05', t: 'Nấc phân áp ở đúng vị trí vận hành' },
        { c: 'TBA-06', t: 'Tủ RMU / máy cắt trung thế: áp suất SF6 trong vùng xanh, chỉ thị trạng thái đúng' },
        { c: 'TBA-07', t: 'Rơ le bảo vệ cài đặt đúng phiếu chỉnh định, không có cảnh báo; nguồn DC / UPS cấp cho rơ le tốt' },
        { c: 'TBA-08', t: 'Chống sét van trung thế, bộ đếm sét; cáp và đầu cáp trung thế không có dấu hiệu phóng điện' },
        { c: 'TBA-09', t: 'Tiếp địa trung tính, vỏ MBA và vỏ tủ trung thế đầy đủ, chắc chắn' },
        { c: 'TBA-10', t: 'Hàng rào, cửa khóa, biển "Cấm vào – Điện cao áp", hố thu dầu, thông gió trạm' },
        { c: 'TBA-11', t: 'Dụng cụ an toàn trung thế: sào thao tác, găng, ủng cách điện, bút thử điện, tiếp địa di động còn hạn kiểm định' },
        { c: 'TBA-12', t: 'Ắc quy / UPS cho hệ thống điều khiển: điện áp tốt, có biên bản kiểm tra định kỳ', u: 'V' }
      ]
    },
    {
      id: 'TD', title: 'Tiếp địa & chống sét',
      items: [
        { c: 'TD-01', t: 'Khung pin, giá đỡ, máng cáp kim loại được liên kết đẳng thế liên tục' },
        { c: 'TD-02', t: 'Dây tiếp địa đúng tiết diện, màu vàng – xanh; đầu cốt bắt chắc, không ăn mòn' },
        { c: 'TD-03', t: 'Đo điện trở tiếp địa hệ thống, đạt giá trị thiết kế', u: 'Ω', h: 'Thông thường ≤ 4 Ω cho tiếp địa an toàn, ≤ 10 Ω cho chống sét (theo thiết kế được duyệt).' },
        { c: 'TD-04', t: 'Kim thu sét, dây thoát sét đúng vị trí; vùng bảo vệ bao phủ dàn pin; không đổ bóng lên tấm pin' },
        { c: 'TD-05', t: 'Hố kiểm tra tiếp địa có nắp, có đánh dấu, dễ tiếp cận; hộp test tháo lắp được để đo' }
      ]
    },
    {
      id: 'GS', title: 'Giám sát, SCADA & truyền thông',
      items: [
        { c: 'GS-01', t: 'Datalogger / SCADA online, thu đủ dữ liệu từ tất cả inverter, công tơ, cảm biến' },
        { c: 'GS-02', t: 'Sản lượng trên hệ thống giám sát khớp với công tơ', u: '%', h: 'Ghi % sai lệch trong cùng kỳ. Yêu cầu thường ≤ 2 %.' },
        { c: 'GS-03', t: 'Trạm thời tiết: cảm biến bức xạ sạch, cân bằng, còn hạn hiệu chuẩn; cảm biến nhiệt độ gắn đúng', h: 'Ghi ngày hết hạn hiệu chuẩn pyranometer.' },
        { c: 'GS-04', t: 'Cảnh báo (email / app / SMS) đã được cấu hình gửi tới đội O&M' },
        { c: 'GS-05', t: 'Kết nối internet ổn định, có đường dự phòng; router / switch có nguồn UPS' },
        { c: 'GS-06', t: 'Truy cập từ xa vào inverter / logger hoạt động; mật khẩu mặc định đã được đổi' },
        { c: 'GS-07', t: 'Kết nối và truyền dữ liệu về trung tâm điều độ / điện lực hoạt động (nếu yêu cầu)' },
        { c: 'GS-08', t: 'Camera giám sát và đầu ghi hoạt động, thời gian lưu trữ đủ theo yêu cầu' }
      ]
    },
    {
      id: 'DD', title: 'Đo đếm & hòa lưới',
      items: [
        { c: 'DD-01', t: 'Công tơ hai chiều / công tơ ranh giới đúng chủng loại, còn hạn kiểm định, niêm phong đầy đủ' },
        { c: 'DD-02', t: 'Chỉ số công tơ phát lên lưới tại thời điểm bàn giao', u: 'kWh', h: 'Chụp ảnh màn hình công tơ làm bằng chứng. Đây là mốc chốt sản lượng giữa hai bên.' },
        { c: 'DD-03', t: 'Chỉ số công tơ nhận từ lưới tại thời điểm bàn giao', u: 'kWh' },
        { c: 'DD-04', t: 'TU / TI đo đếm có tem kiểm định; hộp đấu dây được niêm phong' },
        { c: 'DD-05', t: 'Hệ thống chống phát ngược (zero export) / giới hạn công suất hoạt động đúng thỏa thuận', s: 'roof', h: 'Thử bằng cách giảm tải hoặc xem log của bộ điều khiển.' },
        { c: 'DD-06', t: 'Điện áp, tần số, Cosφ tại điểm đấu nối nằm trong giới hạn cho phép' },
        { c: 'DD-07', t: 'Sản lượng lũy kế từ COD đến ngày bàn giao', u: 'kWh' }
      ]
    },
    {
      id: 'AT', title: 'An toàn, PCCC & biển báo',
      items: [
        { c: 'AT-01', t: 'Bình chữa cháy (CO₂ / bột) đủ số lượng, đúng vị trí, còn hạn kiểm tra' },
        { c: 'AT-02', t: 'Hệ thống báo cháy / chữa cháy (nếu có) hoạt động và đã được nghiệm thu' },
        { c: 'AT-03', t: 'Nút dừng khẩn cấp / thiết bị ngắt nhanh (rapid shutdown) hoạt động, có nhãn rõ ràng' },
        { c: 'AT-04', t: 'Biển cảnh báo nguy hiểm điện, sơ đồ thoát nạn, nội quy khu vực đầy đủ' },
        { c: 'AT-05', t: 'Thang lên mái cố định, có lồng bảo vệ và kiểm soát ra vào', s: 'roof' },
        { c: 'AT-06', t: 'Lan can mép mái, dây cứu sinh (lifeline), điểm neo dây an toàn còn hạn kiểm định', s: 'roof' },
        { c: 'AT-07', t: 'Lối tiếp cận chữa cháy và khoảng trống giữa các cụm pin trên mái theo quy định PCCC', s: 'roof' },
        { c: 'AT-08', t: 'Tủ thuốc sơ cứu; bảng số điện thoại khẩn cấp (114, 115, điện lực, chủ đầu tư)' },
        { c: 'AT-09', t: 'Chiếu sáng khu vực trạm, tủ điện và chiếu sáng sự cố' },
        { c: 'AT-10', t: 'Vật liệu dễ cháy, rác thải xây dựng đã được dọn sạch' }
      ]
    },
    {
      id: 'MB', title: 'Mặt bằng & hạ tầng',
      items: [
        { c: 'MB-01', t: 'Hàng rào, cổng, khóa nguyên vẹn; không có điểm xâm nhập', s: 'ground float' },
        { c: 'MB-02', t: 'Đường nội bộ đủ cho xe bảo trì, xe rửa pin đi lại', s: 'ground float' },
        { c: 'MB-03', t: 'Thoát nước mưa thông suốt; không xói lở, không ngập úng', s: 'ground' },
        { c: 'MB-04', t: 'Cỏ, thực vật được kiểm soát, không che bóng tấm pin', s: 'ground' },
        { c: 'MB-05', t: 'Nguồn nước rửa pin (bể, bơm, họng nước) sẵn sàng; chất lượng nước phù hợp', h: 'Nước có độ cứng / độ mặn cao để lại cặn trên kính.' },
        { c: 'MB-06', t: 'Nhà điều hành, kho phụ tùng, nhà vệ sinh, chốt bảo vệ sẵn sàng sử dụng', s: 'ground float' },
        { c: 'MB-07', t: 'Không có nguồn bụi, khói, hơi hóa chất bất thường gần dàn pin (ống khói, quạt hút xưởng)', s: 'roof', h: 'Ghi vị trí nguồn bụi để tăng tần suất vệ sinh khu vực đó.' }
      ]
    },
    {
      id: 'VT', title: 'Vật tư dự phòng & dụng cụ',
      items: [
        { c: 'VT-01', t: 'Tấm pin dự phòng đủ số lượng theo hợp đồng, cùng model', u: 'tấm' },
        { c: 'VT-02', t: 'Connector MC4, cầu chì DC, SPD dự phòng', h: 'Ghi số lượng từng loại vào ghi chú.' },
        { c: 'VT-03', t: 'Inverter / bo mạch / quạt dự phòng (nếu có trong hợp đồng)' },
        { c: 'VT-04', t: 'Dụng cụ chuyên dụng bàn giao: kìm bấm MC4, khóa tháo MC4, cờ lê lực...' },
        { c: 'VT-05', t: 'Biên bản kiểm đếm vật tư dự phòng có xác nhận hai bên' }
      ]
    },
    {
      id: 'HQ', title: 'Hiệu suất vận hành & đào tạo',
      items: [
        { c: 'HQ-01', t: 'Chỉ số hiệu suất PR (Performance Ratio) từ COD so với cam kết', u: '%', h: 'PR = sản lượng thực tế / (bức xạ × công suất DC danh định).' },
        { c: 'HQ-02', t: 'Sản lượng thực tế so với dự báo (PVsyst) cùng kỳ', u: '%' },
        { c: 'HQ-03', t: 'Hệ số khả dụng (Availability) của nhà máy', u: '%' },
        { c: 'HQ-04', t: 'Không có string / inverter ngừng hoạt động hoặc sản lượng bằng 0' },
        { c: 'HQ-05', t: 'Tồn tại của EPC chưa khắc phục đã được liệt kê, có cam kết thời hạn xử lý' },
        { c: 'HQ-06', t: 'Đào tạo vận hành cho đội O&M đã hoàn thành (có biên bản đào tạo)' }
      ]
    }
  ]
};
